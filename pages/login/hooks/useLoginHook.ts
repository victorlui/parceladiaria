import { useAlerts } from "@/components/useAlert";
import { ApiUserData } from "@/interfaces/login_inteface";
import { CPFSchema } from "@/lib/cpf_validation";
import api from "@/services/api";
import { checkCPF as checkCPFService } from "@/services/check-cpf";
import { login } from "@/services/login";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { useVerificationStore } from "@/store/validation";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { useNavigationFlow } from "@/hooks/useNavigationFlow";

export function useLoginHook() {
  const { showError } = useAlerts();
  const { setStep, setToken, setData, setEtapa } = useRegisterStore();
  const { handleFlow } = useNavigationFlow();

  const checkCPFMutation = useMutation({
    mutationFn: ({ cpf }: CPFSchema) => checkCPFService(cpf),
    onSuccess: ({ data: { type }, message }) => {
      if (!type && message === "Sem cadastro") {
        setStep(0);
        router.replace("/(register)/step1");
        return;
      }

      if ((type && type === "lead") || type === "client") {
        router.push("/insert-password");
        return;
      }
    },
    onError: (error: any) => {
      showError("Ops!", error.message || "Ocorreu um erro inesperado.");
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ cpf, password }: { cpf: string; password: string }) =>
      login(cpf, password),
    onSuccess: async (data: any, variables) => {
      try {
        if ((data as any)?.needs_otp === true) {
          useVerificationStore.getState().handleData({
            needs_otp: true,
            first_login: true,
            phone_masked: (data as any)?.phone_masked,
            email_masked: (data as any)?.email_masked,
            cpf: (data as any)?.cpf,
            password: variables.password,
          });
          router.replace("/verification");
          return;
        }

        const type = data?.data?.type;
        const etapa = data?.data?.etapa;
        const status = data?.data?.status;

        if (type === "lead") {
          setToken(data?.token);
          const response = await api.get(`/v1/client`);

          setData({
            ...data?.data,
            primeira_analise: response?.data?.data?.data?.primeira_analise ?? 0,
          });

          const path = handleFlow(type, etapa, status);
          router.replace(path as any);
          return;
        }

        if (type === "client") {
          useAuthStore.getState().setToken(data?.token);
          const response = await api.get(`/v1/client/data/info`);
          const userData = response?.data?.data || {};
          const user: ApiUserData = {
            nome: userData.name,
            email: userData.email,
            cpf: userData.cpf,
            cidade: userData.city,
            bairro: userData.neighborhood,
            status: userData.status,
            estado: userData.uf,
            endereco: userData.address,
            msg_painel: userData.msg_painel,
            msg_status: userData.msg_status,
            lastLoan: data?.data?.lastLoan,
            zip_code: userData.zip_code,
            phone: userData.phone,
            pix: userData.chave_pix ?? "",
            status_doc: userData.status_doc,
            isLoggedIn: true,
            observacoes: userData.observacoes,
            email_verificado: userData.email_verificado,
            phone_verificado: userData.phone_verificado,
            type,
            ...data?.data,
          };

          await useAuthStore.getState().login(data?.token, user);

          const path = handleFlow(type, etapa, status);
          router.replace(path as any);
          return;
        }

        // Fallback para caso não caia em nenhum type conhecido
        showError("Ops!", "Tipo de usuário desconhecido ou não configurado.");
      } catch (error: any) {
        showError(
          "Ops!",
          "Ocorreu um erro ao carregar os dados do usuário. Tente novamente.",
        );
      }
    },
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      if (status === 403 || status === 429) {
        return;
      }

      const errorMessage =
        (error.data && error.data.data.error) ||
        error?.message ||
        "Senha incorreta";
      showError("Ops!", errorMessage);
    },
  });

  return {
    checkCPFMutation,
    loginMutation,
  };
}
