export type Indicacao = {
  id: number;
  nome: string;
  status: string;
  data: string;
  recompensa: string | number | null;
  parcelas: {
    pagas: number;
    total: number;
  };
};

export type SaqueAtual = {
  id?: number;
  status: string;
  valor?: string | number;
  erro?: string | null;
};

export type RequisitosIndicacaoV3 = {
  tem_contrato?: boolean;
  parcela1_paga?: boolean;
};

export type IndicacoesV3 = {
  programa_ativo?: boolean;
  apto?: boolean;
  termos_aceitos?: boolean;
  pode_indicar?: boolean;
  requisitos?: RequisitosIndicacaoV3;
  vagas_por_contrato?: number;
  valor_recompensa?: number;
  vagas_total?: number;
  vagas_usadas?: number;
  vagas_disponiveis?: number;
  aprovados_ciclo?: number;
  cta_renovacao?: boolean;
};

export type Indications = {
  foi_indicado?: boolean;
  codigo_disponivel?: boolean;
  codigo?: string;
  indicacoes?: Indicacao[];
  limit?: number;
  limite?: number;
  limite_atingido?: boolean;
  link?: string;
  pix_key?: string;
  saldo?: number;
  saque_atual?: SaqueAtual | string | null;
  termos_aceitos?: boolean;
  valor_minimo_saque?: number;
  valor_recompensa?: number;
  v3?: IndicacoesV3;
};

export type IndicationResponse = {
  data: Indications | null;
  message?: string;
  success?: boolean;
};
