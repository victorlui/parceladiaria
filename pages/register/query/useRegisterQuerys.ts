import { ANALYTICS_FLOWS } from "@/analytics/events";
import { updateUserService } from "@/services/register";
import { useRegisterStore } from "@/store/register_new";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

type RegisterMutationRequest = {
  request: any;
  analyticsFlow?: any;
  analyticsSource?: any;
  registerStep?: any;
  suppressErrorAlert?: boolean;
};

export function useRegisterQuery() {
  return useMutation({
    mutationFn: (request: RegisterMutationRequest) => {
      return updateUserService({
        request: request.request,
        analyticsContext: {
          flow: request.analyticsFlow ?? ANALYTICS_FLOWS.REGISTER,
          source: request.analyticsSource ?? "useRegisterQuery",
          register_step: request.registerStep,
          etapa: request.request?.etapa,
        },
      });
    },
    onSuccess: async (data: any) => {
      return data;
    },
    onError: (error: any, variables: RegisterMutationRequest) => {
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
      } else if (variables?.suppressErrorAlert) {
        return error;
      } else {
        Alert.alert("Atenção", error.message || "Erro ao atualizar usuário");
      }
    },
  });
}
