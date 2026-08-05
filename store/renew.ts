import { create } from "zustand";

export interface RenewGate {
  ativo: boolean;
  bloqueado: boolean;
  gate_id: string | null;
  loan_count: number;
  vencidas: number;
  limiar: number | null;
  x_a_pagar: number;
  sandbox: boolean;
  gates_versao: number;
}

export type RefinMotivo =
  | "refin_parcelas_abertas"
  | "refin_periodo_carencia"
  | "refin_ok"
  | "refin_desligado"
  | "fora_faixa"
  | "fail_open";

export interface RenewGateRefin {
  ativo: boolean;
  bloqueado: boolean;
  motivo: RefinMotivo;
  parcelas_em_aberto: number;
  data_liberacao: string;
  data_liberacao_br: string;
  sandbox: boolean;
}

export interface RenewProps {
  can_renew: boolean;
  date: string;
  date_info?: string;
  message: string;
  remaining_paid: number;
  gate?: RenewGate | null;
  gate_refin?: RenewGateRefin | null;
  hide_overdue_step?: boolean | null;
}

interface RenewState {
  renew: RenewProps | null;
  selectItemRenew: any | null;
  setRenew: (renew: RenewProps) => void;
  setItemRenew: (item: any) => void;
}

export const useRenewStore = create<RenewState>((set) => ({
  renew: null,
  selectItemRenew: null,
  setRenew: (renew: RenewProps) => set({ renew }),
  setItemRenew: (item: any) => set({ selectItemRenew: item }),
}));
