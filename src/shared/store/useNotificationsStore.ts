import { create } from "zustand";

type AuthState = {
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
};

export const useNotificationsStore = create<AuthState>((set) => ({
  pushToken: null,
  setPushToken: (token) => set({ pushToken: token }),
}));
