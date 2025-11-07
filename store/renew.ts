import { create } from "zustand";

interface RenewProps {
  can_renew: boolean;
  date: string;
  message: string;
  remaining_paid: number;
}

interface RenewState {
  renew: RenewProps | null;
  setRenew: (renew: RenewProps) => void;
}

export const useRenewStore = create<RenewState>((set) => ({
  renew: null,
  setRenew: (renew: RenewProps) => set({ renew }),
}));
