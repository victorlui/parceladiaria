import { updateUserService } from "@/services/register";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

export function useRegisterQuery() {
  const authStore = useAuthStore.getState();

  const { logout } = authStore;

  return useMutation({
    mutationFn: (request: any) => {
      return updateUserService({ request: request.request });
    },
    onSuccess: (data: any) => {
      if (!data.success) {
        return data;
      }

      console.log("update success", data);

      if (data.etapa === Etapas.FINALIZADO) {
        return data;
      }

      if (data.etapa === Etapas.LIMITE) {
        useRegisterStore.getState().setStep(4);
        return data;
      }

      if (data.etapa === Etapas.CNPJ) {
        useRegisterStore.getState().setStep(8);
        return data;
      }

      if (data.etapa === Etapas.INFORMANDO_TIPO_COMERCIO) {
        useRegisterStore.getState().setStep(9);
        return data;
      }

      if (data.etapa === Etapas.REGISTRANDO_EMAIL) {
        useRegisterStore.getState().setStep(5);
        return data;
      }

      if (data.etapa === Etapas.REGISTRANDO_ENDERECO) {
        useRegisterStore.getState().setStep(7);
        return data;
      }

      return data;
    },
    onError: (error: any) => {
      if (error.status === 401) {
        Alert.alert(
          "Sessão expirada",
          "Sua sessão expirou. Por favor, faça login novamente.",
          [
            {
              text: "OK",
              onPress: () => {
                logout();
                router.replace("/login");
              },
            },
          ],
        );
      } else {
        Alert.alert("Atenção", error.message || "Erro ao atualizar usuário");
      }
    },
  });
}
