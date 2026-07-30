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

export interface RenewProps {
  can_renew: boolean;
  date: string;
  message: string;
  remaining_paid: number;
  gate?: RenewGate | null;
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
