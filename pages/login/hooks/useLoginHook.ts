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
  [Etapas.AFILIADO_CODE]: 3,
  [Etapas.REGISTRANDO_PROFISSAO]: 4,
  [Etapas.LIMITE]: 5,
  [Etapas.REGISTRANDO_EMAIL]: 6,
  [Etapas.REGISTRANDO_PIX]: 7,
  [Etapas.REGISTRANDO_ENDERECO]: 8,
  [Etapas.CNPJ]: 9,
  [Etapas.INFORMANDO_TIPO_COMERCIO]: 10,
};

export function useLoginHook() {
  const { showError } = useAlerts();
  const { setStep, setToken, setData, setEtapa } = useRegisterStore();

  const checkCPFMutation = useMutation({
    mutationFn: ({ cpf }: CPFSchema) => checkCPFService(cpf),
    onSuccess: ({ data: { type }, message }, variables) => {
      if (!type && message === "Sem cadastro") {
        setStep(0);
        router.replace("/(register)/step1");
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
      if ((data as any)?.needs_otp === true) {
        useVerificationStore.getState().handleData({
          needs_otp: true,
          first_login: true,
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

      console.log("data login", data);

      if (type === "lead") {
        setToken(data?.token);
        const response = await api.get(`/v1/client`);

        setData({
          ...data?.data,
          primeira_analise: response.data.data.data.primeira_analise ?? 0,
        });

        const goToRegisterStep1 = (nextStep: number) => {
          setStep(nextStep);
          router.replace("/(register)/step1");
        };

        if (status === StatusCadastro.PENDENTE) {
          if (etapa === Etapas.ACEITANDO_TERMOS) {
            setEtapa(Etapas.ACEITANDO_TERMOS);
            setStep(8);
            router.replace("/(register)/termos");
            return;
          }

          if (etapa === Etapas.OPEN_FINANCE) {
            setEtapa(Etapas.OPEN_FINANCE);
            setStep(8);
            router.replace("/(register)/openfinance");
            return;
          }

          const step = stepMap[etapa as Etapas];

          if (step !== undefined) {
            goToRegisterStep1(step);
          }

          return;
        }

        if (
          etapa === Etapas.OPEN_FINANCE &&
          status === StatusCadastro.RECUSADO
        ) {
          router.replace("/recusado_screen");
          return;
        }

        if (etapa === Etapas.INICIO && status === StatusCadastro.DIVERGENTE) {
          router.replace("/divergencia_screen");
          return;
        }

        if (etapa === Etapas.FINALIZADO) {
          if (status === StatusCadastro.PROPOSTA_EXPIRADO) {
            router.replace("/divergencia_screen");
            return;
          }
          const routeByStatus: Partial<Record<StatusCadastro, string>> = {
            [StatusCadastro.DIVERGENTE]: "/divergencia_screen",
            [StatusCadastro.PRE_APROVADO]: "/pre_aprovado_screen",
            [StatusCadastro.RECUSADO]: "/recusado_screen",
            [StatusCadastro.REANALISE]: "/reanalise_screen",
            [StatusCadastro.ANALISE]: "/analise_screen",
            [StatusCadastro.APROVADO]: "/pre_aprovado_screen",
          };

          const route: any = routeByStatus[status as StatusCadastro];
          if (route) {
            router.replace(route);
          }

          return;
        }

        const step = stepMap[etapa as Etapas];
        goToRegisterStep1(step ?? 0);
        return;
      }

      if (type === "client") {
        const response = await api.get(`/v1/client/data/info`);
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
          email_verificado: response.data.data.email_verificado,
          phone_verificado: response.data.data.phone_verificado,
        };
        useAuthStore.getState().login(data?.token, user);
        router.replace("/(tabs)/home");
        return;
      }
    },
    onError: (error: any) => {
      const status = error?.status ?? error?.response?.status;
      if (status === 403 || status === 429) {
        return;
      }

      showError("Ops!", "Senha incorreta");
    },
  });

  return {
    checkCPFMutation,
    loginMutation,
  };
}
