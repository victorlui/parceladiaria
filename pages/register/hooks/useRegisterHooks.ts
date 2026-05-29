import { useAlerts } from "@/components/useAlert";
import api from "@/services/api";
import { checkCPF } from "@/services/check-cpf";
import { useRegisterStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { formatarData } from "@/utils/formats";
import { useNavigation } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler, Keyboard } from "react-native";
import { useRegisterQuery } from "../query/useRegisterQuerys";
import { Address } from "../types/address";

export function useRegisterHooks() {
  const { showWarning, showError } = useAlerts();
  const { setData, data, setToken, token, step, setStep } = useRegisterStore();
  const { mutateAsync } = useRegisterQuery();
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const onBackPress = useCallback(() => {
    if (step <= 0) {
      router.replace("/login");
      return true;
    }

    if (step === 9) {
      setStep(4);
      return true;
    }

    if (step === 5 && data?.profissao === "Comerciante") {
      setStep(10);
      return true;
    }

    setStep(Math.max(0, step - 1));
    return true;
  }, [data?.profissao, setStep, step]);

  useFocusEffect(
    useCallback(() => {
      const hardwareSub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      const beforeRemoveSub = navigation.addListener(
        "beforeRemove",
        (e: any) => {
          const actionType = e?.data?.action?.type;
          if (actionType !== "POP" && actionType !== "GO_BACK") return;
          e.preventDefault();
          onBackPress();
        },
      );

      return () => {
        hardwareSub.remove();
        beforeRemoveSub();
      };
    }, [navigation, onBackPress]),
  );

  // gravando cpf e aniversario
  const handleNextStep1 = async (cpf: string, birthDate: string) => {
    Keyboard.dismiss();

    setIsLoading(true);
    try {
      const formattedBirthDate = formatarData(birthDate);

      if (!formattedBirthDate) {
        showError("Atenção", "Data de nascimento inválida");
        return;
      }

      const isNewUser = data?.cpf && data.cpf !== cpf;

      if (isNewUser) {
        setToken(null);
      }

      setData({
        ...(isNewUser ? {} : data || {}),
        cpf,
        nascimento: formattedBirthDate,
      });

      const { data: cpfSearch } = await api.get(
        `/auth/search/cpf/${cpf}/${formattedBirthDate}`,
      );

      if (cpfSearch?.data?.status === "recusado") {
        showError("Atenção", "Data de Nascimento inválida");
        return;
      }

      const response: any = await checkCPF(cpf, formattedBirthDate!);
      if (response.message === "Cadastro Localizado") {
        showWarning("Alerta!", "O CPF informado já está cadastrado. ");
        return;
      } else {
        setStep(1);
        //router.push("/(register)/step2");
        return;
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showError(
          "Error",
          "Não foi possível verificar o CPF. Tente novamente.",
        );
        return;
      }
      if (error.response && error.response.status === 403) {
        showWarning(
          "Atenção",
          "Você fez muitas requisições, aguarde um momento e tente novamente.",
        );
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // gravando senha
  const handleNextStep2 = async (password: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      setData({
        ...data,
        password,
      });
      setStep(2);
      //router.push("/(register)/step3");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // gravando telefone e criando a conta
  const handleNextStep3 = async (phone: string) => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      const hasToken = !!token;

      if (!data?.cpf || (!data?.password && !hasToken)) {
        showError(
          "Atenção",
          "Dados do cadastro incompletos. Reinicie o cadastro.",
        );
        return;
      }

      const newData = {
        ...data,
      };

      if (!hasToken) {
        const registerData = {
          cpf: data.cpf,
          phone: cleanedPhone,
          password: data.password,
        };

        const response = await api.post("/auth/register", registerData);
        setToken(response.data.data.token);

        newData.nome = response.data.data.name;
        newData.status = response.data.data.status;
      }

      await mutateAsync({
        request: {
          etapa: Etapas.AFILIADO_CODE,
          phone: cleanedPhone,
        },
      });

      setData({
        ...newData,
        phone: cleanedPhone,
        whatsapp: cleanedPhone,
      });
      setStep(3);
      return;
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showError("Atenção", error.response.data.message);
      }
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // gravando código de afiliado
  const handleNextStepAffiliateCode = async (code: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const request = {
        etapa: Etapas.REGISTRANDO_PROFISSAO,
        afiliado: code,
      };

      await mutateAsync({ request });
      setData({
        ...data,
        afiliado: code,
      });
      setIsLoading(false);
      setStep(4);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // gravando profissao
  const handleNextStep4 = async (item: any) => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const profissao = String(item?.label ?? "").trim();

      if (!profissao) {
        showError("Atenção", "Selecione uma profissão válida");
        return;
      }

      await mutateAsync({
        request: {
          etapa: Etapas.REGISTRANDO_PROFISSAO,
          profissao,
        },
      });

      const etapa = item.id === "comerciante" ? Etapas.CNPJ : Etapas.LIMITE;
      const nextStep = etapa === Etapas.CNPJ ? 9 : 5;

      try {
        await mutateAsync({ request: { etapa } });
      } catch {}

      setData({
        ...data,
        profissao,
      });
      setIsLoading(false);
      setStep(nextStep);
      return;
    } catch {
      showError("Atenção", "Erro ao continuar");
    } finally {
      setIsLoading(false);
    }
  };

  // comerciante gravando cnpj
  const handleNextStepCNPJ = async (cnpj: any) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await mutateAsync({
        request: {
          cnpj,
          etapa: Etapas.INFORMANDO_TIPO_COMERCIO,
        },
      });
      setIsLoading(false);
      setStep(10);
      return;
    } catch {
      showError("Atenção", "Erro ao continuar");
    } finally {
      setIsLoading(false);
    }
  };

  // comerciante gravando tipo de comércio
  const handleNextStepBussinesType = async (businesType: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await mutateAsync({
        request: {
          tipo_comercio: businesType,
          etapa: Etapas.LIMITE,
        },
      });
      setIsLoading(false);
      setStep(5);
      return;
    } catch {
      showError("Atenção", "Erro ao continuar");
    } finally {
      setIsLoading(false);
    }
  };

  // gravando limite pre-aprovado
  const handleNextStep5 = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      setStep(6);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // gravando email
  const handleNextStep6 = async (email: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const request = {
        email,
        etapa: Etapas.REGISTRANDO_PIX,
      };

      await mutateAsync({ request });
      setData({
        ...data,
        email,
        etapa: Etapas.REGISTRANDO_PIX,
      });
      setIsLoading(false);
      setStep(7);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // gravando pix
  const handleNextStep7 = async (pix: string, selected: string | null) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const request = {
        chave: selected,
        pix,
        etapa: Etapas.REGISTRANDO_ENDERECO,
      };

      await mutateAsync({ request });
      setData({
        ...data,
        chave: selected,
        pix,
        etapa: Etapas.REGISTRANDO_ENDERECO,
      });
      setIsLoading(false);
      setStep(8);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // gravando endereco
  const handleNextStep8 = async (address: Address) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const payload = {
        ...address,
        etapa: Etapas.OPEN_FINANCE,
      };

      await mutateAsync({ request: payload });
      setData({
        ...data,
        endereco: address.endereco,
        numero: address.numero,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        cep: address.cep,
        etapa: Etapas.OPEN_FINANCE,
      });
      setIsLoading(false);
      router.replace("/(register)/openfinance");
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (step: number) => {
    setStep(step);
    router.push(`/(register)/step1`);
  };

  return {
    handleNextStep1,
    handleNextStep2,
    handleNextStep3,
    handleNextStep4,
    handleNextStep5,
    handleNextStep6,
    handleNextStep7,
    handleNextStep8,
    handleNextStepCNPJ,
    handleNextStepBussinesType,
    handleNextStepAffiliateCode,
    handlePrevStep: onBackPress,
    isLoading,
    step,
    handleNextStep,
  };
}
