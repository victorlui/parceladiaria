import { ApiUserData } from "@/interfaces/login_inteface";
import { Etapas } from "@/utils";
import { create } from "zustand";

interface RegisterAuth extends Omit<ApiUserData, "cpf"> {
  cpf?: string | null;
  password?: string | null;
  //   phone?: string | null;
  //   etapa?: Etapas | null;
  //   token?: string | null;
}

type Register = {
  token?: string | null;
  data: RegisterAuth | null;
  etapa: Etapas;
  step: number;
  clean: () => void;
  setData: (data: RegisterAuth) => void;
  setToken: (token: string | null) => void;
  setEtapa: (etapa: Etapas) => void;
  setStep: (step: number) => void;
};

export const useRegisterStore = create<Register>((set) => ({
  token: null,
  data: null,
  etapa: Etapas.INICIO,
  step: 0,
  clean: () => set({ token: null, data: null, etapa: Etapas.INICIO, step: 0 }),
  setData: (data: RegisterAuth) => set({ data }),
  setToken: (token: string | null) => set({ token }),
  setEtapa: (etapa: Etapas) => set({ etapa }),
  setStep: (step: number) => set({ step }),
}));
