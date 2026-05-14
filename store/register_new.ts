import { ApiUserData } from "@/interfaces/login_inteface";
import { Etapas } from "@/utils";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

interface RegisterAuth extends Omit<ApiUserData, "cpf"> {
  cpf?: string | null;
  password?: string | null;
  afiliado?: string | null;
}

type Register = {
  token?: string | null;
  data: RegisterAuth | null;
  etapa: Etapas;
  step: number;
  hydrated: boolean;
  clean: () => void;
  setData: (data: RegisterAuth) => void;
  setToken: (token: string | null) => void;
  setEtapa: (etapa: Etapas) => void;
  setStep: (step: number) => void;
  setHydrated: (hydrated: boolean) => void;
};

const registerStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

const initialState = {
  token: null as string | null,
  data: null as RegisterAuth | null,
  etapa: Etapas.INICIO as Etapas,
  step: 0,
  hydrated: false,
};

export const useRegisterStore = create<Register>()(
  persist(
    (set) => ({
      ...initialState,
      clean: () => set({ ...initialState, hydrated: true }),
      setData: (data: RegisterAuth) => set({ data }),
      setToken: (token: string | null) => set({ token }),
      setEtapa: (etapa: Etapas) => set({ etapa }),
      setStep: (step: number) => set({ step }),
      setHydrated: (hydrated: boolean) => set({ hydrated }),
    }),
    {
      name: "register_new",
      storage: createJSONStorage(() => registerStorage),
      partialize: (state) => ({
        token: state.token,
        data: state.data,
        etapa: state.etapa,
        step: state.step,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
