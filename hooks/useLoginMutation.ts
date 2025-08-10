import { useMutation } from "@tanstack/react-query";
import { CPFSchema } from "@/lib/cpf_validation";
import { checkCPF } from "@/services/check-cpf";
import { router } from "expo-router";
import { login } from "@/services/login";
import { Etapas, getRouteByEtapa } from "@/utils";
import { useAuthStore } from "@/store/auth";

export const useCheckCPFMutation = () => {
  return useMutation({
    mutationFn: ({ cpf }: CPFSchema) => checkCPF(cpf),
    onSuccess: ({ data: { type }, message }) => {
      if (!type && message === "Sem cadastro") {
        router.push("/(register)/terms-of-use");
      }

      if (type && type === "lead") {
        router.push("/insert-password");
      }
    },
    onError: (error: any) => {
      alert(error.message || "Erro ao logar");
    },
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: ({ cpf, password }: { cpf: string; password: string }) =>
      login(cpf, password),
    onSuccess: (data) => {
      const { etapa, status } = data.data;
      console.log("login", data);
      // Store login data
      useAuthStore.getState().login(data.token, data.data);

      if (etapa === Etapas.FINALIZADO && status === "pendente") {
         router.push("/(app)/video_screen");
      } else {
        const rota = getRouteByEtapa(etapa as Etapas);

        if (rota) {
          router.push(rota as any);
        }
      }

      return data;
    },
    onError: (error: any) => {
      alert(error.message || "Erro ao logar");
    },
  });
};
