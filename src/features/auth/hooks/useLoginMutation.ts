import { useRegisterStore } from "@/features/register/store/useRgisterStore";
import {
  routeByStatus,
  StatusCadastro,
  stepByEtapa,
} from "@/shared/utils/etapas";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { CheckCPFService } from "../service/check-cpf";
import { LoginService } from "../service/login";
import { useAuthStore } from "../store/useAuthStore";

export function useLoginMutation() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setStep = useRegisterStore((state) => state.setStep);

  const checkCPFMutation = useMutation({
    mutationFn: ({ cpf, birthDate }: any) => CheckCPFService(cpf, birthDate),
    onSuccess: (data: any, variables: any) => {
      updateUser({
        cpf: variables.cpf,
      });

      if (data.message === "Cadastro Localizado") {
        router.push("/(auth)/password");
        return;
      }

      if (data.message === "Sem cadastro") {
        router.push("/register");
        return;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ password }: any) =>
      LoginService({ cpf: user?.cpf || "", password }),
    onSuccess: (data) => {
      console.log("login mutation", data);
      const userData = data?.data || data;

      updateUser({
        ...userData,
        token: data?.token || "",
      });

      const route: any = routeByStatus[userData.status as StatusCadastro];

      // Se estiver pendente, vamos para a tela de registro e configuramos o step correto baseado na etapa
      if (userData.status === StatusCadastro.PENDENTE) {
        const step = userData.etapa ? stepByEtapa[userData.etapa] : undefined;
        // Se a etapa existir no mapa usamos ela, se não o default será o step 4
        setStep(step ?? 4);
      }

      console.log("route login", route);
      router.push(route);
      return;
    },
  });

  return {
    checkCPFMutation,
    loginMutation,
  };
}
