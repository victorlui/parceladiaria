import { create } from "zustand";

interface RenewProps {
  can_renew: boolean;
  date: string;
  message: string;
  remaining_paid: number;
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
