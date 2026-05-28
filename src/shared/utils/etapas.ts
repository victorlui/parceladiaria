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
  CNPJ = "Registrando CNPJ",
  INFORMANDO_TIPO_COMERCIO = "Informando Tipo Comércio",
  LIMITE = "Limite",
  REGISTRANDO_EMAIL = "Registrando Email",
  REGISTRANDO_PIX = "registrando_pix",
  REGISTRANDO_ENDERECO = "registrando_endereco",
  OPEN_FINANCE = "Openfinance",
  ACEITANDO_TERMOS = "Aceitando termos",
}

// Mapeia a string da etapa retornada pelo backend para o número do step no frontend
export const stepByEtapa: Record<string, number> = {
  [Etapas.INICIO]: 3, // Ou o step que faz sentido para INICIO
  [Etapas.AFFILIATE_CODE]: 4,
  [Etapas.REGISTRANDO_PROFISSAO]: 5,
  [Etapas.CNPJ]: 6,
  [Etapas.INFORMANDO_TIPO_COMERCIO]: 7,
  [Etapas.LIMITE]: 8,
  [Etapas.REGISTRANDO_EMAIL]: 9,
  [Etapas.REGISTRANDO_PIX]: 10,
  [Etapas.REGISTRANDO_ENDERECO]: 11,
  [Etapas.OPEN_FINANCE]: 12,
  [Etapas.ACEITANDO_TERMOS]: 13,
};

export const routeByStatus: Partial<Record<StatusCadastro, string>> = {
  [StatusCadastro.PENDENTE]: "/register",
};
