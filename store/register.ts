import { AddressSchema } from "@/lib/address_validation";
import { Etapas } from "@/utils";
import { create } from "zustand";

type RegisterAuth = {
  cpf: string | null;
  email: string | null;
  phone: string | null;
  code: string | null;
  address: AddressSchema | null;
  etapa: Etapas | null;
  password: string | null;
  setPassword: (password: string) => void;
  setEtapa: (etapa: Etapas) => void;
  setCpf: (cpf: string) => void;
  setPhone: (phone: string) => void;
  setCode: (code: string) => void;
  setAddress: (address: AddressSchema) => void;
  setEmail: (email: string) => void;
  clean: () => void;
};

export const useRegisterAuthStore = create<RegisterAuth>((set) => ({
  cpf: null,
  phone: null,
  code: null,
  address: null,
  isLoading: true,
  etapa: null,
  password: null,
  email: null,

  setPassword: (password) => {
    set({ password });
  },
  setEtapa: (etapa) => {
    set({ etapa });
  },

  setCpf: (cpf) => {
    set({ cpf });
  },

  setPhone: (phone) => {
    set({ phone });
  },

  setEmail: (email) => {
    set({ email });
  },


  setCode: (code) => {
    set({ code });
  },

  setAddress: (address: AddressSchema) => {
    set({ address });
  },

  clean: () => {
    set({ cpf: null, phone: null, code: null, address: null });
  },
}));
