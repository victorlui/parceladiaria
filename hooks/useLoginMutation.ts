import { useMutation } from "@tanstack/react-query";
import { CPFSchema } from "@/lib/cpf_validation";
import { checkCPF } from "@/services/check-cpf";
import { router } from "expo-router";
import { login } from "@/services/login";
import { Etapas, getRouteByEtapa, StatusCadastro } from "@/utils";
import { useAuthStore } from "@/store/auth";
import { useAlerts } from "@/components/useAlert";
import api from "@/services/api";
import { ApiUserData } from "@/interfaces/login_inteface";
import { is } from "zod/v4/locales";

export const useCheckCPFMutation = () => {
  const { showError } = useAlerts();
  return useMutation({
    mutationFn: ({ cpf }: CPFSchema) => checkCPF(cpf),
    onSuccess: ({ data: { type }, message }) => {
      if (!type && message === "Sem cadastro") {
        router.push("/(register)/terms-of-use");
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
  return useMutation({
    mutationFn: ({ cpf, password }: { cpf: string; password: string }) =>
      login(cpf, password),
    onSuccess: async (data) => {
      const { etapa, status, type } = data.data;
      const { token } = data;

      console.log("login:", data);

      if (type === "lead") {
        useAuthStore.getState().register(data.token, data.data);
        if (status === Etapas.APP_ANALISE) {
          router.replace("/analise_screen");
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
            router.replace(rota as any);
          }
        }
      } else {
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
          lastLoan: data.data.lastLoan,
          zip_code: response.data.data.zip_code,
          phone: response.data.data.phone,
          pixKey: "",
          isLoggedIn: true,
        };

        useAuthStore.getState().login(data.token, user);
        //router.push("/(tabs)");
        router.replace("/analise_screen");
      }

      console.log("data.data", data.data);

      return data;
    },
    onError: (error: any) => {
      console.log("error login", error.response);
      showError("Ops!", error.message || "Ocorreu um erro inesperado.");
    },
  });
};
