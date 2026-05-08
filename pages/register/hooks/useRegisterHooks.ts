import { formatarData } from "@/utils/formats";
import { useCallback, useState } from "react";
import { BackHandler, Keyboard } from "react-native";
import api from "@/services/api";
import { useAlerts } from "@/components/useAlert";
import { checkCPF } from "@/services/check-cpf";
import { useRegisterStore } from "@/store/register_new";
import { router, useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Etapas } from "@/utils";
import { useRegisterQuery } from "../query/useRegisterQuerys";
import { Address } from "../types/address";

export function useRegisterHooks() {
  const { showWarning, showError } = useAlerts();
  const { setData, data, setToken, step, setStep } = useRegisterStore();
  const { mutate, isPending } = useRegisterQuery();
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const onBackPress = useCallback(() => {
    if (step === 0) {
      router.replace("/login");
      return true;
    }

    if (step === 8) {
      setStep(3);
      return true;
    }

    if (step === 4 && data?.profissao === "Comerciante") {
      setStep(9);
      return true;
    }

    setStep(step - 1);
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

      const { data } = await api.get(
        `/auth/search/cpf/${cpf}/${formattedBirthDate}`,
      );

      console.log("data", data);

      if (data?.data?.status === "recusado") {
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
      console.log("error", error.response.data.message);
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
      const registerData = {
        cpf: data?.cpf,
        phone: phone.replace(/\D/g, ""),
        password: data?.password,
      };

      const response = await api.post("/auth/register", registerData);

      setToken(response.data.data.token);
      setData({
        nome: response.data.data.name,
        status: response.data.data.status,
      });
      setStep(3);
      return;
    } catch (error: any) {
      showWarning(
        "Erro ao continuar",
        error.response?.data?.message || "Erro ao verificar código",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // gravando profissao
  const handleNextStep4 = async (item: any) => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      let etapa = item.id === "comerciante" ? Etapas.CNPJ : Etapas.LIMITE;

      const request = {
        etapa,
        profissao: item.label,
      };

      mutate({ request });
      setStep(etapa === Etapas.CNPJ ? 8 : 4);
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
      mutate({
        request: {
          cnpj: cnpj,
          etapa: Etapas.INFORMANDO_TIPO_COMERCIO,
        },
      });
      setStep(9);
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
      mutate({
        request: {
          tipo_comercio: businesType,
          etapa: Etapas.LIMITE,
        },
      });
      setStep(4);
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
      setStep(5);
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
        email: email,
        etapa: Etapas.REGISTRANDO_PIX,
      };
      setData({
        ...data,
        email,
        etapa: Etapas.REGISTRANDO_PIX,
      });
      mutate({ request });
      setStep(6);
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
        pix: pix,
        etapa: Etapas.REGISTRANDO_ENDERECO,
      };

      setData({
        ...data,
        chave: selected,
        pix,
        etapa: Etapas.REGISTRANDO_ENDERECO,
      });
      mutate({ request: request });
      setStep(7);
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

      setData({
        ...data,
        endereco: address.endereco,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        cep: address.cep,
        etapa: Etapas.OPEN_FINANCE,
      });
      mutate({ request: payload });
      router.push("/(register)/openfinance");
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
    isLoading: isPending || isLoading,
    step,
    handleNextStep,
  };
}
