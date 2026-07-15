import { AnalyticsService } from "@/analytics/analytics.service";
import { trackAppError } from "@/analytics/error-handler";
import {
  ANALYTICS_FLOWS,
  DIVERGENCIA_ANALYTICS_SOURCES,
  EVENTS,
} from "@/analytics/events";
import { useAlerts } from "@/components/useAlert";
import { ApiUserData } from "@/interfaces/login_inteface";
import { api, withAnalytics } from "@/services/api";
import { updateUserService } from "@/services/register";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

type RouteByStatus = Record<string, string>;
type AlertContentByStatus = Record<string, { title: string; message: string }>;

type FinalizeStatusOutcome = {
  kind: "status";
  status: string | null;
  targetRoute: string | null;
  alertTitle: string;
  alertMessage: string;
};

type FinalizeClientOutcome = {
  kind: "client";
  dataClient: any;
};

export type FinalizeDivergenciaFlowResult =
  | FinalizeStatusOutcome
  | FinalizeClientOutcome;

type FinalizeOptions = {
  deferCompletion?: boolean;
};

type CompleteOptions = {
  silent?: boolean;
};

const routeByStatus: RouteByStatus = {
  divergente: "/divergencia_screen",
  recusado: "/recusado_screen",
  aprovado: "/pre_aprovado_screen",
  "pre-aprovado": "/pre_aprovado_screen",
  analise: "/analise_screen",
  reanalise: "/reanalise_screen",
  "proposta-expirada": "/divergencia_screen",
};

const alertContent: AlertContentByStatus = {
  divergente: {
    title: "Ação Necessária",
    message: "Encontramos uma divergência nos seus dados.",
  },
  recusado: {
    title: "Cadastro Recusado",
    message: "Infelizmente seu cadastro não foi aprovado.",
  },
  aprovado: {
    title: "Cadastro Aprovado",
    message: "Parabéns! Seu cadastro foi aprovado.",
  },
  "pre-aprovado": {
    title: "Cadastro Pré-Aprovado",
    message: "Parabéns! Seu cadastro foi pré-aprovado.",
  },
  analise: {
    title: "Aguarde um momento",
    message:
      "Documentos enviados com sucesso. Seu cadastro ainda está em análise. Por favor, aguarde.",
  },
  reanalise: {
    title: "Aguarde um momento",
    message:
      "Documentos enviados com sucesso. Seu cadastro está em reanálise. Por favor, aguarde.",
  },
  "proposta-expirada": {
    title: "Proposta Expirada",
    message: "Sua proposta expirou. É necessário atualizar os dados.",
  },
};

function navigateToTargetRoute(targetRoute: string | null) {
  if (targetRoute && targetRoute !== "/divergencia_screen") {
    router.replace(targetRoute as any);
    return;
  }

  useRegisterStore.getState().clean();
  router.replace("/login");
}

export function useFinalizeDivergenciaFlow() {
  const { showError, showSuccess } = useAlerts();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const isMountedRef = useRef(true);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loginClientAndRedirect = useCallback(async (dataClient: any) => {
    AnalyticsService.track(EVENTS.OFFER_CREATED, {
      flow: ANALYTICS_FLOWS.DIVERGENCIA,
      source: DIVERGENCIA_ANALYTICS_SOURCES.FINALIZE_CLIENT,
    });

    const infoResponse = await api.get(
      "/v1/client/data/info",
      withAnalytics({
        flow: ANALYTICS_FLOWS.DIVERGENCIA,
        source: DIVERGENCIA_ANALYTICS_SOURCES.FINALIZE_CLIENT_INFO,
      }),
    );
    const userData = infoResponse.data?.data || {};
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
      lastLoan: dataClient?.lastLoan,
      zip_code: userData.zip_code,
      phone: userData.phone,
      pix: userData.chave_pix ?? "",
      status_doc: userData.status_doc,
      isLoggedIn: true,
      observacoes: userData.observacoes,
      email_verificado: userData.email_verificado,
      phone_verificado: userData.phone_verificado,
    };
    const token = useRegisterStore.getState().token || "";

    await useAuthStore.getState().login(token, user);
    router.replace("/(tabs)/home");
  }, []);

  const completeFinalizeOutcome = useCallback(
    async (
      outcome: FinalizeDivergenciaFlowResult,
      options?: CompleteOptions,
    ) => {
      if (outcome.kind === "client") {
        await loginClientAndRedirect(outcome.dataClient);
        return;
      }

      if (options?.silent) {
        navigateToTargetRoute(outcome.targetRoute);
        return;
      }

      showSuccess(outcome.alertTitle, outcome.alertMessage, () => {
        navigateToTargetRoute(outcome.targetRoute);
      });
    },
    [loginClientAndRedirect, showSuccess],
  );

  const finalizeDivergenciaFlow = useCallback(
    async (
      options?: FinalizeOptions,
    ): Promise<FinalizeDivergenciaFlowResult | undefined> => {
      if (isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setLoadingSubmit(true);

      try {
        await updateUserService({
          request: { etapa: Etapas.FINALIZADO },
          analyticsContext: {
            flow: ANALYTICS_FLOWS.DIVERGENCIA,
            source: DIVERGENCIA_ANALYTICS_SOURCES.FINALIZE_UPDATE,
          },
        });

        const response = await api.get(
          "/v1/client",
          withAnalytics({
            flow: ANALYTICS_FLOWS.DIVERGENCIA,
            source: DIVERGENCIA_ANALYTICS_SOURCES.FINALIZE_CLIENT,
          }),
        );
        const responseData = response.data?.data?.data;
        const dataClient = responseData || response.data?.data || response.data;

        let outcome: FinalizeDivergenciaFlowResult;

        if (dataClient?.type === "client") {
          outcome = {
            kind: "client",
            dataClient,
          };
        } else {
          const status = dataClient?.status ?? null;
          const registerStore = useRegisterStore.getState();

          registerStore.setData({
            ...registerStore.data,
            ...dataClient,
            primeira_analise: responseData?.primeira_analise ?? 0,
          });
          registerStore.setToken(registerStore.token || "");

          outcome = {
            kind: "status",
            status,
            targetRoute:
              status && routeByStatus[status] ? routeByStatus[status] : null,
            alertTitle:
              status && alertContent[status]
                ? alertContent[status].title
                : "Aguarde um momento",
            alertMessage:
              status && alertContent[status]
                ? alertContent[status].message
                : "Documentos enviados com sucesso. Seu cadastro ainda está em análise. Por favor, aguarde.",
          };
        }

        if (!options?.deferCompletion) {
          await completeFinalizeOutcome(outcome);
        }

        return outcome;
      } catch (error: any) {
        if (error?.response?.status === 401) return;

        trackAppError(error, {
          flow: ANALYTICS_FLOWS.DIVERGENCIA,
          source: DIVERGENCIA_ANALYTICS_SOURCES.FINALIZE_UPDATE,
        });

        showError(
          "Erro",
          error?.message ||
            "Não foi possível enviar os documentos. Tente novamente.",
        );
      } finally {
        isSubmittingRef.current = false;
        if (isMountedRef.current) setLoadingSubmit(false);
      }
    },
    [completeFinalizeOutcome, showError],
  );

  return {
    finalizeDivergenciaFlow,
    completeFinalizeOutcome,
    loadingSubmit,
  };
}
