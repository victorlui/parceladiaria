import { useAlerts } from "@/components/useAlert";
import { ApiUserData } from "@/interfaces/login_inteface";
import { CPFSchema } from "@/lib/cpf_validation";
import api from "@/services/api";
import { checkCPF as checkCPFService } from "@/services/check-cpf";
import { login } from "@/services/login";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { useVerificationStore } from "@/store/validation";
import { Etapas, StatusCadastro } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

const stepMap: Partial<Record<Etapas, number>> = {
  [Etapas.INICIO]: 3,
  [Etapas.LIMITE]: 4,
  [Etapas.REGISTRANDO_PIX]: 6,
  [Etapas.REGISTRANDO_ENDERECO]: 7,
  [Etapas.CNPJ]: 8,
  [Etapas.INFORMANDO_TIPO_COMERCIO]: 9,
};

export function useLoginHook() {
  const { showError } = useAlerts();
  const { setStep, setToken, setData } = useRegisterStore();

  const checkCPFMutation = useMutation({
    mutationFn: ({ cpf }: CPFSchema) => checkCPFService(cpf),
    onSuccess: ({ data: { type }, message }) => {
      if (!type && message === "Sem cadastro") {
        setStep(0);
        router.push("/(register)/step1");
        return;
      }

      if ((type && type === "lead") || type === "client") {
        router.push("/insert-password");
        return;
      }
    },
    onError: (error: any) => {
      showError("Ops!", error.message || "Ocorreu um erro inesperado.");
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ cpf, password }: { cpf: string; password: string }) =>
      login(cpf, password),
    onSuccess: async (data: any) => {
      console.log("data sucesso login", data);
      if ((data as any)?.needs_otp === true) {
        useVerificationStore.getState().handleData({
          needs_otp: true,
          phone_masked: (data as any)?.phone_masked,
          email_masked: (data as any)?.email_masked,
          cpf: (data as any)?.cpf,
        });
        router.replace("/verification");
        return;
      }

      const type = data?.data.type;
      const etapa = data?.data.etapa;
      const status = data?.data.status;

      if (type === "lead") {
        setData(data?.data);
        setToken(data?.token);

        console.log("status", status);

        if (status === StatusCadastro.DIVERGENTE) {
          router.replace("/divergencia_screen");
          return;
        } else if (status === StatusCadastro.PRE_APROVADO) {
          router.replace("/pre_aprovado_screen");
          return;
        } else if (status === StatusCadastro.RECUSADO) {
          router.replace("/recusado_screen");
          return;
        } else if (status === StatusCadastro.REANALISE) {
          router.replace("/reanalise_screen");
          return;
        } else if (status === StatusCadastro.ANALISE) {
          router.replace("/analise_screen");
          return;
        } else {
          if (etapa === Etapas.OPEN_FINANCE) {
            router.push("/(register)/openfinance");
            return;
          }

          const step = stepMap[etapa as Etapas];

          if (step) {
            setStep(step);
            router.replace("/(register)/step1");
            return;
          }

          setStep(0);
          router.replace("/(register)/step1");
          return;
        }
      }

      if (type === "client") {
        console.log("data client login", data?.data);
        useAuthStore.getState().setToken(data?.token);
        const response = await api.get(`/v1/client/data/info`);
        console.log("data client", response.data.data);
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
          lastLoan: data?.data.lastLoan,
          zip_code: response.data.data.zip_code,
          phone: response.data.data.phone,
          pix: response.data.data.chave_pix ?? "",
          status_doc: response.data.data.status_doc,
          isLoggedIn: true,
          observacoes: response.data.data.observacoes,
        };
        useAuthStore.getState().login(data?.token, user);
        router.replace("/(tabs)/home");
        return;
      }
    },
    onError: (error: any) => {
      showError("Ops!", error.message || "Ocorreu um erro inesperado.");
    },
  });

  return {
    checkCPFMutation,
    loginMutation,
  };
}
