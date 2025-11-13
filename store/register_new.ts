import { Etapas } from "@/utils";
import { create } from "zustand";

interface RegisterAuth {
  cpf?: string | null;
  password?: string | null;
  phone?: string | null;
  etapa?: Etapas | null;
  token?: string | null;
}

type RegisterNew = {
  data: RegisterAuth | null;
  clean: () => void;
  setData: (data: RegisterAuth) => void;
};

export const useRegisterNewStore = create<RegisterNew>((set) => ({
  data: null,
  clean: () => set({ data: null }),
  setData: (data: RegisterAuth) => set({ data }),
}));
