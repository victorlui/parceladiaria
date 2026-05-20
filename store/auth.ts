import { ApiUserData } from "@/interfaces/login_inteface";
import { queryClient } from "@/lib/queryClient";
import { create } from "zustand";
import { getToken, getUser, removeToken, saveToken } from "../lib/authStorage";

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
  register: (token: string | null, user: ApiUserData | null) => void;
  logout: () => void;
  setToken: (token: string) => void;
  setUser: (user: ApiUserData | null) => void;
  restoreToken: (opts?: {
    retries?: number;
    retryDelayMs?: number;
  }) => Promise<void>;
  setUserRegister: (userRegister: ApiUserData | null) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  userRegister: null,
  tokenRegister: null,
  postLoginRedirect: null,
  isLoading: true,
  can_renew: false,
  cpfValid: null,
  setUserRegister: (userRegister) => {
    set({ userRegister });
  },
  setCpfValid: (cpfValid) => {
    set({ cpfValid });
  },
  setCanRenew: (can_renew) => {
    set({ can_renew });
  },

  login: (token, user) => {
    console.log("login", token, user);
    saveToken(token, user);
    set({ token, user: user ? { ...user, isLoggedIn: true } : null });
  },

  register: (token, user) => {
    set({ tokenRegister: token, userRegister: user });
  },

  setUser: (user) => {
    const token = get().token;

    set({ user });
    if (token) {
      saveToken(token, user);
    }
  },

  setToken: (token) => {
    const prevToken = get().token;
    if (prevToken && prevToken !== token) {
      queryClient.clear();
      set({ token, user: null });
      saveToken(token, null);
      return;
    }

    const user = get().user;
    set({ token });
    saveToken(token, user);
  },

  logout: async () => {
    try {
      await removeToken();
      queryClient.clear();
      set({ token: null, user: null });
    } catch (error) {
      console.log("logout", error);
    }
  },

  restoreToken: async (opts) => {
    set({ isLoading: true });
    try {
      const retries = Math.max(0, opts?.retries ?? 0);
      const retryDelayMs = Math.max(0, opts?.retryDelayMs ?? 350);

      let [token, user] = await Promise.all([getToken(), getUser()]);

      if (!token && retries > 0) {
        for (let i = 0; i < retries; i++) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          const [nextToken, nextUser] = await Promise.all([getToken(), getUser()]);
          token = nextToken;
          user = nextUser;
          if (token) break;
        }
      }

      set({
        token,
        user: token && user ? { ...user, isLoggedIn: true } : user,
        isLoading: false,
      });
    } catch (error: any) {
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
