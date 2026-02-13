import { create } from "zustand";
import { getToken, getUser, removeToken, saveToken } from "../lib/authStorage";
import { ApiUserData } from "@/interfaces/login_inteface";
import { queryClient } from "@/lib/queryClient";

type AuthState = {
  token: string | null;
  user: ApiUserData | null;
  userRegister: ApiUserData | null;
  tokenRegister: string | null;
  isLoading: boolean;
  can_renew: boolean;
  cpfValid: string | null;
  setCpfValid: (cpfValid: string | null) => void;
  setCanRenew: (can_renew: boolean) => void;
  login: (token: string, user: ApiUserData | null) => void;
  register: (token: string, user: ApiUserData | null) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setUser: (user: ApiUserData | null) => void;
  restoreToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  userRegister: null,
  tokenRegister: null,
  isLoading: true,
  can_renew: false,
  cpfValid: null,
  setCpfValid: (cpfValid) => {
    set({ cpfValid });
  },
  setCanRenew: (can_renew) => {
    set({ can_renew });
  },

  login: (token, user) => {
    saveToken(token, user);
    set({ token, user: user ? { ...user, isLoggedIn: true } : null });
  },

  register: (token, user) => {
    set({ tokenRegister: token, userRegister: user });
  },

  setUser: (user) => {
    const token = get().token;
    set({ user });
    saveToken(token!, user);
  },

  setToken: (token) => {
    const user = get().user;
    set({ token });
    saveToken(token, user);
  },

  logout: () => {
    removeToken();
    queryClient.clear();
    set({ token: null, user: null });
  },

  restoreToken: async () => {
    set({ isLoading: true });
    try {
      const token = await getToken();
      const user = await getUser();
      set({ token, user, isLoading: false });
    } catch (error: any) {
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
