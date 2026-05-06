import api from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { CPFSchema } from "@/lib/cpf_validation";
import { checkCPF } from "@/services/check-cpf";
import { router } from "expo-router";
import { login } from "@/services/login";
import { Etapas, getRouteByEtapa, StatusCadastro } from "@/utils";
import { useAuthStore } from "@/store/auth";
import { useAlerts } from "@/components/useAlert";
import { ApiUserData } from "@/interfaces/login_inteface";
import { useSettingsStore } from "@/store/settings";
import { useVerificationStore } from "@/store/validation";

export const useCheckCPFMutation = () => {
  const { showError } = useAlerts();
  return useMutation({
    mutationFn: ({ cpf }: CPFSchema) => checkCPF(cpf),
    onSuccess: ({ data: { type }, message }) => {
      if (!type && message === "Sem cadastro") {
        router.push("/(register_new)/register-cpf");
      }

      if ((type && type === "lead") || type === "client") {
        router.push("/insert-password");
      }
    },
    onError: (error: any) => {
      showError("Ops!", error.message || "Ocorreu um erro inesperado.");
    },
  });
};

export const useLoginMutation = () => {
  const { showError } = useAlerts();
  const { setOpenfinance } = useSettingsStore();
  return useMutation({
    mutationFn: ({ cpf, password }: { cpf: string; password: string }) =>
      login(cpf, password),
    onSuccess: async (data) => {
      if ((data as any)?.needs_otp === true) {
        useVerificationStore.getState().handleData({
          needs_otp: true,
          phone_masked: (data as any)?.phone_masked,
          email_masked: (data as any)?.email_masked,
          cpf: (data as any)?.cpf,
        });
        router.replace("/verification");
        return;
      }

      const token = (data as any)?.token;
      const openfinance = (data as any)?.openfinance;
      const userData = (data as any)?.data;

      if (typeof token !== "string" || token.length === 0 || !userData) {
        showError("Ops!", "Resposta inválida do servidor.");
        return;
      }

      const { type, etapa, status } = userData;

      const responseClient = await api.get("v1/client", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("userData", userData);

      if (openfinance) {
        setOpenfinance({
          openfinance,
        });
      }

      if (type === "lead") {
        useAuthStore.getState().register(token, {
          otp_obrigatorio: responseClient.data.data.data.otp_obrigatorio,
          ...userData,
        });
        if (status === Etapas.APP_ANALISE) {
          router.replace("/analise_screen");
          //router.replace("/pre_aprovado_screen");
        } else if (status === StatusCadastro.DIVERGENTE) {
          router.replace("/divergencia_screen");
        } else if (status === StatusCadastro.PRE_APROVADO) {
          router.replace("/pre_aprovado_screen");
        } else if (status === StatusCadastro.RECUSADO) {
          router.replace("/recusado_screen");
        } else if (status === StatusCadastro.REANALISE) {
          router.replace("/reanalise_screen");
        } else {
          const rota = getRouteByEtapa(etapa as Etapas);

          if (rota) {
            router.push(rota as any);
            //router.push("/(register_new)/timeless_face");
          }
        }
        return data;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get(`/v1/client/data/info`);

      const user: ApiUserData = {
        nome: response.data.data.name,
        email: response.data.data.email,
        cpf: response.data.data.cpf,
        cidade: response.data.data.city,
        bairro: response.data.data.neighborhood,
        status: response.data.data.status,
        estado: response.data.data.uf,
        endereco: response.data.data.address,
        msg_painel: response.data.data.msg_painel,
        msg_status: response.data.data.msg_status,
        lastLoan: userData.lastLoan,
        zip_code: response.data.data.zip_code,
        phone: response.data.data.phone,
        pixKey: responseClient.data.data.data.pixKey ?? "",
        status_doc: response.data.data.status_doc,
        isLoggedIn: true,
        observacoes: response.data.data.observacoes,
        otp_obrigatorio: responseClient.data.data.data.otp_obrigatorio,
      };

      useAuthStore.getState().login(token, user);

      if (
        response.data.data.status_doc === "Divergente" &&
        response.data.data.status !== "Regular"
      ) {
        router.replace("/divergencia_old_docs_screen");
        return;
      }
      router.push("/(tabs)/home");
      return data;
    },
    onError: (error: any) => {
      showError("Ops!", error.message || "Ocorreu um erro inesperado.");
    },
  });
};
