import { useAuthStore } from "@/features/auth/store/useAuthStore";
import api from "@/shared/service/api";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { Etapas } from "@/shared/utils/etapas";
import { formatarData } from "@/shared/utils/format";
import { useState } from "react";
import { useRegisterStore } from "../store/useRgisterStore";
import { useUpdateUserHook } from "./useUpdateUserHook";

export function useRegisterHook() {
  const { showAlert } = useAlertStore();
  const { nextStep, prevStep, currentStep } = useRegisterStore();
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
      });
      nextStep();
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleNextStep1,
    handleNextStep2,
    handleNextStep3,
    handleNextStep4,
    isLoading: isLoading || isPending,
  };
}
