import { create } from "zustand";
import { getToken, getUser, removeToken, saveToken } from "../lib/authStorage";
import { ApiUserData } from "@/interfaces/login_inteface";

type AuthState = {
  token: string | null;
  user: ApiUserData | null;
  isLoading: boolean;
  can_renew: boolean;
  setCanRenew: (can_renew: boolean) => void;
  login: (token: string, user: ApiUserData | null) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setUser: (user: ApiUserData | null) => void;
  restoreToken: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,
  can_renew: false,
  setCanRenew: (can_renew) => {
    set({ can_renew });
  },
  
  login: (token, user) => {
    saveToken(token, user);
    set({ token, user: user });
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
    set({ token: null, user: null });
  },

  restoreToken: async () => {
    const token = await getToken();
    const user = await getUser();
    set({ token, isLoading: false, user });
  },

 
}));
