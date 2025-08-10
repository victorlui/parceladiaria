import { create } from "zustand";
import { getToken, getUser, removeToken, saveToken } from "../lib/authStorage";
import { ApiUserData } from "@/interfaces/login_inteface";

type AuthState = {
  token: string | null;
  user: ApiUserData | null;
  isLoading: boolean;
  login: (token: string, user: ApiUserData | null) => void;
  logout: () => void;
  restoreToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  
  login: (token,user) => {
    saveToken(token,user);
    set({ token,user:user });
  },

  logout: () => {
    removeToken();
    set({ token: null });
  },

  restoreToken: async () => {
    const token = await getToken();
    const user = await getUser();
    set({ token, isLoading: false, user });
  },
}));
