export type Indicacao = {
  id: number;
  nome: string;
  status: string;
  data: string;
  recompensa: number | null;
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

export type Indications = {
  codigo: string;
  indicacoes: Indicacao[];
  limit?: number;
  limite_atingido?: boolean;
  link?: string;
  pix_key?: string;
  saldo?: number;
  saque_atual?: SaqueAtual | string | null;
  termos_aceitos?: boolean;
  valor_minimo_saque?: number;
  valor_recompensa?: number;
};

export type IndicationResponse = {
  data: Indications | null;
  message?: string;
  success?: boolean;
};
