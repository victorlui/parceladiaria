import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { CheckCPFService } from "../service/check-cpf";
import { LoginService } from "../service/login";
import { useAuthStore } from "../store/useAuthStore";

export function useLoginMutation() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const checkCPFMutation = useMutation({
    mutationFn: ({ cpf, birthDate }: any) => CheckCPFService(cpf, birthDate),
    onSuccess: (data: any, variables: any) => {
      updateUser({
        cpf: variables.cpf,
      });
      console.log("checkCPFMutation", data);

      if (data.message === "Cadastro Localizado") {
        router.replace("/(auth)/password");
        return;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ password }: any) =>
      LoginService({ cpf: user?.cpf || "", password }),
    onSuccess: (data) => {
      console.log("login mutation", data);
      if (data?.user) {
        updateUser({
          token: data.token || null,
          ...data.data,
        });
      }
    },
  });

  return {
    checkCPFMutation,
    loginMutation,
  };
}
