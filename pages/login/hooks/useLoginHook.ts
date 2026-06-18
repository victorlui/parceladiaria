import {
  ANALYTICS_FLOWS,
  LOGIN_ANALYTICS_SOURCES,
  VERIFICATION_ANALYTICS_SOURCES,
} from "@/analytics/events";
import { useAlerts } from "@/components/useAlert";
import { ApiUserData } from "@/interfaces/login_inteface";
import { CPFSchema } from "@/lib/cpf_validation";
import { api, withAnalytics } from "@/services/api";
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
  const { setStep, setToken, setData } = useRegisterStore();
  const { handleFlow } = useNavigationFlow();

  const checkCPFMutation = useMutation({
    mutationFn: ({ cpf }: CPFSchema) =>
      checkCPFService(cpf, undefined, {
        flow: ANALYTICS_FLOWS.LOGIN,
        source: LOGIN_ANALYTICS_SOURCES.CHECK_CPF,
      }),
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
    mutationFn: ({
      cpf,
      password,
      analyticsFlow = ANALYTICS_FLOWS.LOGIN,
      analyticsSource = LOGIN_ANALYTICS_SOURCES.SUBMIT_PASSWORD,
    }: {
      cpf: string;
      password: string;
      analyticsFlow?: string;
      analyticsSource?: string;
    }) =>
      login(cpf, password, {
        flow: analyticsFlow,
        source: analyticsSource,
      }),
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
          const response = await api.get(
            `/v1/client`,
            withAnalytics({
              flow: ANALYTICS_FLOWS.REGISTER,
              source:
                variables.analyticsSource ===
                VERIFICATION_ANALYTICS_SOURCES.COMPLETE_LOGIN
                  ? VERIFICATION_ANALYTICS_SOURCES.LOAD_INCOMPLETE_REGISTRATION
                  : LOGIN_ANALYTICS_SOURCES.LOAD_INCOMPLETE_REGISTRATION,
            }),
          );

          setData({
            ...data?.data,
            nome: data?.data?.nome,
            email: data?.data?.email,
            cpf: data?.data?.cpf,
            primeira_analise: response?.data?.data?.data?.primeira_analise ?? 0,
          });

          const path = handleFlow(type, etapa, status);
          router.replace(path as any);
          return;
        }

        if (type === "client") {
          useAuthStore.getState().setToken(data?.token);
          const response = await api.get(
            `/v1/client/data/info`,
            withAnalytics({
              flow:
                variables.analyticsFlow === ANALYTICS_FLOWS.VERIFICATION
                  ? ANALYTICS_FLOWS.VERIFICATION
                  : ANALYTICS_FLOWS.LOGIN,
              source:
                variables.analyticsSource ===
                VERIFICATION_ANALYTICS_SOURCES.COMPLETE_LOGIN
                  ? VERIFICATION_ANALYTICS_SOURCES.LOAD_CLIENT_INFO
                  : LOGIN_ANALYTICS_SOURCES.LOAD_CLIENT_INFO,
            }),
          );
          const userData = response?.data?.data || {};
          const user: ApiUserData = {
            ...data?.data,
            lastLoan: data?.data?.lastLoan,
            nome: userData.name ?? data?.data?.nome,
            email: userData.email ?? data?.data?.email,
            cpf: userData.cpf ?? data?.data?.cpf,
            cidade: userData.city ?? data?.data?.cidade,
            bairro: userData.neighborhood ?? data?.data?.bairro,
            status: userData.status ?? data?.data?.status,
            estado: userData.uf ?? data?.data?.estado,
            endereco: userData.address ?? data?.data?.endereco,
            msg_painel: userData.msg_painel ?? data?.data?.msg_painel,
            msg_status: userData.msg_status ?? data?.data?.msg_status,
            zip_code: userData.zip_code ?? data?.data?.zip_code,
            phone: userData.phone ?? data?.data?.phone,
            pix: (userData.chave_pix ?? data?.data?.pix ?? "") as any,
            status_doc: userData.status_doc ?? data?.data?.status_doc,
            observacoes: userData.observacoes ?? data?.data?.observacoes,
            email_verificado:
              userData.email_verificado ?? data?.data?.email_verificado,
            phone_verificado:
              userData.phone_verificado ?? data?.data?.phone_verificado,
            type,
            isLoggedIn: true,
          };

          await useAuthStore.getState().login(data?.token, user);

          const path = handleFlow(type, etapa, status);
          router.replace(path as any);
          return;
        }

        // Fallback para caso não caia em nenhum type conhecido
        showError("Ops!", "Tipo de usuário desconhecido ou não configurado.");
      } catch (error: any) {
        console.log("error", error, error.response);
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
