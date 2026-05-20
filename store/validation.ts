import { create } from "zustand";

interface AppState {
  data: {
    needs_otp?: boolean;
    first_login?: boolean;
    phone_masked?: string;
    email_masked?: string;
    cpf?: string;
    password?: string;
  } | null;
  handleData: (data: AppState["data"]) => void;
  reset: () => void;
}

export const useVerificationStore = create<AppState>((set) => ({
  data: null,
  handleData: (data) => set({ data }),
  reset: () => set({ data: null }),
}));
