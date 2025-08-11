import { sendCode, checkOTP } from "@/services/code";
import { registerService, updateUserService } from "@/services/register";
import { useAuthStore } from "@/store/auth";
import { useRegisterAuthStore } from "@/store/register";
import { Etapas, getRouteByEtapa } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

export function useRegisterMutation() {
  const { mutate, isPending, isError, isSuccess, error, data } = useMutation({
    mutationFn: ({ phone, method }: { phone: string; method: string }) =>
      sendCode(phone, method),
    onSuccess: (data) => {
      return data;
    },
    onError: (error: any) => {
      alert(error.message || "Erro ao logar");
    },
  });

  return {
    mutate,
    isPending,
    isError,
    isSuccess,
    error,
    data,
  };
}

export function useCheckOTPMutation() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      checkOTP(phone, code),
    onSuccess: (data) => {
      if (data?.success) {
        alert("Código verificado com sucesso");
        router.push("/(register)/create-password");
      }
      return data;
    },
    onError: (error: any) => {
      alert(error.message || "Erro ao verificar código");
    },
  });
}

export function useRegisterDataMutation() {
  return useMutation({
    mutationFn: ({
      cpf,
      phone,
      password,
    }: {
      cpf: string;
      phone: string;
      password: string;
    }) => registerService(cpf, phone, password),

    onSuccess: (data) => {
      const authStore = useAuthStore.getState();
      const { login } = authStore;
      if (data?.success) {
        login(data.data.token, null);
        router.push("/(register)/birthday_screen");
      }
      return data;
    },
    onError: (error: any) => {
      alert(error.message || "Erro ao verificar código");
    },
  });
}

export function useUpdateUserMutation() {
  return useMutation({
    mutationFn: (request: any) => {
      console.log("fn", request);
      return updateUserService({ request: request.request });
    },
    onSuccess: (data) => {
      if (!data.success) {
        return data;
      }

      const registerStore = useRegisterAuthStore.getState();
      const { setEtapa } = registerStore;
      setEtapa(data.etapa)
      console.log(data);

      if (data.etapa === Etapas.FINALIZADO) {
        Alert.alert("Sucesso", "Seu cadastro foi finalizado com sucesso!", [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
            style: "default",
          },
        ]);
      } else {
        const rota = getRouteByEtapa(data.etapa as Etapas);

        if (rota) {
          router.push(rota as any);
        }
      }

      return data;
    },
    onError: (error: any) => {
      alert(error.message || "Erro ao atualizar dados do usuário");
    },
  });
}
