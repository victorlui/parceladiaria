export enum StatusCadastro {
  DIVERGENTE = "divergente",
  RECUSADO = "recusado",
  APROVADO = "aprovado",
  REANALISE = "reanalise",
  PRE_APROVADO = "pre-aprovado",
  ANALISE = "analise",
  FINALIZADO = "Finalizado",
  FINALIZADO_APP = "finalizado",
  PENDENTE = "pendente",
  PROPOSTA_EXPIRADO = "proposta-expirada",
}

export enum Etapas {
  INICIO = "Inicio",
  AFFILIATE_CODE = "AFILIADO_CODE",
  REGISTRANDO_PROFISSAO = "Informando Profissão",
}

// Mapeia a string da etapa retornada pelo backend para o número do step no frontend
export const stepByEtapa: Record<string, number> = {
  [Etapas.INICIO]: 3, // Ou o step que faz sentido para INICIO
  [Etapas.AFFILIATE_CODE]: 4,
  [Etapas.REGISTRANDO_PROFISSAO]: 5,
};

export const routeByStatus: Partial<Record<StatusCadastro, string>> = {
  [StatusCadastro.PENDENTE]: "/register",
};
