import { create } from "zustand";

interface ConfirmPix {
  id?: number;
  value: string;
  to_receive?: string;
  isLoan?: boolean;
}

interface ConfirmPixStore {
  data: ConfirmPix | null;
  setData: (data: ConfirmPix | null) => void;
}

export const useConfirmPixStore = create<ConfirmPixStore>((set) => ({
  data: null,
  setData: (data: ConfirmPix | null) => set({ data }),
}));
