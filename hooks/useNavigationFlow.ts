import { useRegisterStore } from "@/store/register_new";
import { Etapas, StatusCadastro } from "@/utils";
import { useCallback } from "react";

const stepMap: Partial<Record<Etapas, number>> = {
  [Etapas.INICIO]: 3,
  [Etapas.AFILIADO_CODE]: 3,
  [Etapas.REGISTRANDO_PROFISSAO]: 4,
  [Etapas.LIMITE]: 5,
  [Etapas.REGISTRANDO_EMAIL]: 6,
  [Etapas.REGISTRANDO_PIX]: 7,
  [Etapas.REGISTRANDO_ENDERECO]: 8,
  [Etapas.INFORMANDO_ENDERECO]: 8,
  [Etapas.CNPJ]: 9,
  [Etapas.INFORMANDO_TIPO_COMERCIO]: 10,
};

export function useNavigationFlow() {
  const { setStep, setEtapa } = useRegisterStore();

  const handleFlow = useCallback(
    (
      type: string | undefined,
      etapa: string | undefined,
      status: string | undefined,
    ): string => {
      if (!type) {
        if (etapa) {
          const step = stepMap[etapa as Etapas];
          setStep(step ?? 0);
          return "/(register)/step1";
        }
        return "/login";
      }

      if (type === "lead") {
        if (status === StatusCadastro.PENDENTE) {
          if (etapa === Etapas.ACEITANDO_TERMOS) {
            setEtapa(Etapas.ACEITANDO_TERMOS);
            setStep(8);
            return "/(register)/termos";
          }

          if (etapa === Etapas.OPEN_FINANCE) {
            setEtapa(Etapas.OPEN_FINANCE);
            setStep(8);
            return "/(register)/openfinance";
          }

          if (etapa === Etapas.PALENCA) {
            setEtapa(Etapas.PALENCA);
            setStep(8);
            return "/(register)/palenca";
          }

          const step = stepMap[etapa as Etapas];
          if (step !== undefined) {
            setStep(step);
            return "/(register)/step1";
          } else {
            setStep(0);
            return "/(register)/step1";
          }
        }

        if (
          etapa === Etapas.OPEN_FINANCE &&
          status === StatusCadastro.RECUSADO
        ) {
          return "/recusado_screen";
        }

        if (etapa === Etapas.INICIO && status === StatusCadastro.DIVERGENTE) {
          return "/divergencia_screen";
        }

        if (
          etapa === Etapas.ACEITANDO_TERMOS &&
          status === StatusCadastro.DIVERGENTE
        ) {
          return "/(register)/termos";
        }

        if (etapa === Etapas.FINALIZADO || etapa === Etapas.FINALIZADO_APP) {
          if (status === StatusCadastro.PROPOSTA_EXPIRADO) {
            return "/divergencia_screen";
          }

          const routeByStatus: Partial<Record<StatusCadastro, string>> = {
            [StatusCadastro.DIVERGENTE]: "/divergencia_screen",
            [StatusCadastro.PRE_APROVADO]: "/pre_aprovado_screen",
            [StatusCadastro.RECUSADO]: "/recusado_screen",
            [StatusCadastro.REANALISE]: "/reanalise_screen",
            [StatusCadastro.ANALISE]: "/analise_screen",
            [StatusCadastro.APROVADO]: "/(tabs)/home",
          };

          const route = routeByStatus[status as StatusCadastro];
          if (route) {
            return route;
          }

          return "/(tabs)/home";
        }

        const step = stepMap[etapa as Etapas];
        setStep(step ?? 0);
        return "/(register)/step1";
      }

      if (type === "client") {
        if (etapa === Etapas.FINALIZADO) {
          if (status === StatusCadastro.PROPOSTA_EXPIRADO) {
            return "/divergencia_screen";
          }
          const routeByStatus: Partial<Record<StatusCadastro, string>> = {
            [StatusCadastro.DIVERGENTE]: "/divergencia_screen",
            [StatusCadastro.PRE_APROVADO]: "/pre_aprovado_screen",
            [StatusCadastro.RECUSADO]: "/recusado_screen",
            [StatusCadastro.REANALISE]: "/reanalise_screen",
            [StatusCadastro.ANALISE]: "/analise_screen",
            [StatusCadastro.APROVADO]: "/(tabs)/home",
          };

          const route = routeByStatus[status as StatusCadastro];
          if (route) {
            return route;
          }
        }

        return "/(tabs)/home";
      }

      return "/login";
    },
    [setStep, setEtapa],
  );

  return { handleFlow };
}
