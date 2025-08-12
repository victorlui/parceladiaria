import { useMutation } from "@tanstack/react-query";
import { CPFSchema } from "@/lib/cpf_validation";
import { checkCPF } from "@/services/check-cpf";
import { router } from "expo-router";
import { login } from "@/services/login";
import { Etapas, getRouteByEtapa, StatusCadastro } from "@/utils";
import { useAuthStore } from "@/store/auth";
import { useAlerts } from "@/components/useAlert";

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
    onSuccess: (data) => {
      const { etapa, status, type } = data.data;

      console.log("login", data);

      useAuthStore.getState().login(data.token, data.data);

      if (type === "client") {
        router.push("/(app)/home");
      } else {
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
            router.push(rota as any);
          }
        }
      }

      return data;
    },
    onError: (error: any) => {
      showError("Ops!", error.message || "Ocorreu um erro inesperado.");
    },
  });
};
