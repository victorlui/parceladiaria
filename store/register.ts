import { AddressSchema } from "@/lib/address_validation";
import { create } from "zustand";

type RegisterAuth = {
  cpf: string | null;
  phone: string | null;
  code: string | null;
  address: AddressSchema | null;
  setCpf: (cpf: string) => void;
  setPhone: (phone: string) => void;
  setCode: (code: string) => void;
  setAddress: (address: AddressSchema) => void;
  clean: () => void;
};

export const useRegisterAuthStore = create<RegisterAuth>((set) => ({
  cpf: null,
  phone: null,
  code: null,
  address: null,
  isLoading: true,
  setCpf: (cpf) => {
    set({ cpf });
  },

  setPhone: (phone) => {
    set({ phone });
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
