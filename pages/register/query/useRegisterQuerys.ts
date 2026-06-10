import { updateUserService } from "@/services/register";
import { useRegisterStore } from "@/store/register_new";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

export function useRegisterQuery() {
  return useMutation({
    mutationFn: (request: any) => {
      return updateUserService({ request: request.request });
    },
    onSuccess: async (data: any) => {
      return data;
    },
    onError: (error: any) => {
      if (error.status === 401) {
        Alert.alert(
          "Sessão expirada",
          "Sua sessão expirou. Vamos reiniciar seu cadastro.",
          [
            {
              text: "OK",
              onPress: () => {
                useRegisterStore.getState().clean();
                router.replace("/(register)/step1");
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
