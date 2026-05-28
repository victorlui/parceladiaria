import { useAuthStore } from "@/features/auth/store/useAuthStore";
import api from "@/shared/service/api";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { Etapas } from "@/shared/utils/etapas";
import { formatarData } from "@/shared/utils/format";
import { useState } from "react";
import { useRegisterStore } from "../store/useRgisterStore";
import { Address } from "../types";
import { useUpdateUserHook } from "./useUpdateUserHook";

export function useRegisterHook() {
  const { showAlert } = useAlertStore();
  const { nextStep, setStep } = useRegisterStore();
  const { mutate: updateUserAsync, isPending } = useUpdateUserHook();
  const { updateUser, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep1 = async (cpf: string, birthDate: string) => {
    setIsLoading(true);
    try {
      const birthDateFormated = formatarData(birthDate);

      const { data: cpfSearch } = await api.get(
        `/auth/search/cpf/${cpf}/${birthDateFormated}`,
      );

      if (cpfSearch?.data?.status === "recusado") {
        showAlert("warning", "Atenção!", "Data de Nascimento inválida");
        return;
      }
      updateUser({
        nascimento: birthDateFormated ?? "",
      });
      nextStep();
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep2 = async (password: string) => {
    setIsLoading(true);
    try {
      updateUser({
        password: password,
      });
      nextStep();
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep3 = async (phone: string) => {
    // verificar se tem token porque ja criou a conta
    console.log(user);
    if (user?.token) {
      updateUserAsync({
        whatsapp: phone,
        etapa: Etapas.AFFILIATE_CODE,
      });
      nextStep();
      return;
    }

    // se nao tiver token, criar a conta
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", {
        cpf: user?.cpf,
        password: user?.password,
        phone: phone,
      });
      updateUser({
        ...response.data.data,
        token: response.data.data.token,
        etapa: Etapas.AFFILIATE_CODE,
        whatsapp: phone,
      });
      nextStep();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep4 = async (affiliateCode: string) => {
    setIsLoading(true);
    try {
      updateUser({
        afiliado: affiliateCode,
        etapa: Etapas.REGISTRANDO_PROFISSAO,
      });
      nextStep();
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // gravando profissao
  const handleNextStep5 = async (item: any) => {
    setIsLoading(true);

    try {
      const profissao = String(item?.label ?? "").trim();
      console.log("profissao", profissao);
      if (!profissao) {
        showAlert("warning", "Atenção", "Selecione uma profissão válida");
        return;
      }

      updateUserAsync({
        request: {
          etapa: item.id === "comerciante" ? Etapas.CNPJ : Etapas.LIMITE,
          profissao,
        },
      });
      const nextStep = item.id === "comerciante" ? 6 : 8;
      setStep(nextStep);
    } catch {
      showAlert("error", "Atenção", "Erro ao continuar");
    } finally {
      setIsLoading(false);
    }
  };

  // comerciante gravando cnpj
  const handleNextStep6 = async (cnpj: any) => {
    setIsLoading(true);
    try {
      updateUserAsync({
        request: {
          cnpj,
          etapa: Etapas.INFORMANDO_TIPO_COMERCIO,
        },
      });
      setIsLoading(false);
      nextStep();
      return;
    } catch {
      showAlert("error", "Atenção", "Erro ao continuar");
    } finally {
      setIsLoading(false);
    }
  };

  // comerciante gravando tipo de comércio
  const handleNextStep7 = async (businesType: string) => {
    setIsLoading(true);
    try {
      updateUserAsync({
        request: {
          tipo_comercio: businesType,
          etapa: Etapas.LIMITE,
        },
      });
      nextStep();
    } catch {
      showAlert("error", "Atenção", "Erro ao continuar");
    } finally {
      setIsLoading(false);
    }
  };

  // gravando email
  const handleNextStep8 = async (email: string) => {
    setIsLoading(true);
    try {
      const request = {
        email,
        etapa: Etapas.REGISTRANDO_PIX,
      };

      updateUserAsync({ request });
      updateUser({
        ...user,
        email,
        etapa: Etapas.REGISTRANDO_PIX,
      });
      nextStep();
    } finally {
      setIsLoading(false);
    }
  };

  // gravando pix
  const handleNextStep9 = async (pix: string) => {
    setIsLoading(true);
    try {
      updateUserAsync({
        request: {
          pix,
          etapa: Etapas.REGISTRANDO_ENDERECO,
        },
      });
      nextStep();
    } finally {
      setIsLoading(false);
    }
  };

  // gravando endereco
  const handleNextStep10 = async (address: Address) => {
    setIsLoading(true);
    try {
      updateUserAsync({
        request: {
          ...address,
          etapa: Etapas.OPEN_FINANCE,
        },
      });
      updateUser({
        ...user,
        ...address,
        etapa: Etapas.OPEN_FINANCE,
      });
      nextStep();
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep11 = async () => {
    setIsLoading(true);
    try {
      nextStep();
    } finally {
      setIsLoading(false);
    }
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
    handleNextStep9,
    handleNextStep10,
    handleNextStep11,
    isLoading: isLoading || isPending,
  };
}
