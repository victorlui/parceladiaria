import { useNavigationFlow } from "@/hooks/useNavigationFlow";
import api from "@/services/api";
import { updateUserService } from "@/services/register";
import { useRegisterStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

export function useRegisterQuery() {
  const { handleFlow } = useNavigationFlow();
  return useMutation({
    mutationFn: (request: any) => {
      return updateUserService({ request: request.request });
    },
    onSuccess: async (data: any) => {
      try {
        const response = await api.get("/v1/client");
        const clientData =
          response.data?.data?.data ?? response.data?.data ?? response.data;

        if (clientData?.etapa === Etapas.FINALIZADO) {
          const path = handleFlow(
            clientData?.type,
            Etapas.FINALIZADO,
            clientData?.status,
          );

          router.replace(path as any);
        }
      } catch (error) {
        console.warn("useRegisterQuery:onSuccess /v1/client failed", error);
      }

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
