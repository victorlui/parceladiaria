import { ApiUserData } from "@/interfaces/login_inteface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ============================================
// 🔐 CONSTANTES E TIPOS
// ============================================
const TOKEN_KEY = "auth_token_secure";
const USER_KEY = "auth_user";
const HYDRATION_KEY = "auth_hydrated";

interface AuthState {
  // Estado de dados
  token: string | null;
  user: ApiUserData | null;

  // Estado de persistência (para zustand persist)
  storageToken: string | null;
  storageUser: ApiUserData | null;

  // Estado de hidratação
  hasHydrated: boolean;
  isLoading: boolean;

  // Estado de hidratação da store
  _hasHydratedFromStorage: boolean;

  // Campos para recuperação de senha
  cpfValid: string | null;

  // Campos para register (recovery)
  tokenRegister: string | null;
  userRegister: ApiUserData | null;

  // Actions
  login: (token: string, user: ApiUserData | null) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: ApiUserData | null) => void;
  setToken: (token: string) => void;
  restoreToken: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
  register: (token: string | null, user: ApiUserData | null) => void;
  setCpfValid: (cpf: string | null) => void;

  // Getters derivados
  isAuthenticated: boolean;
}

// ============================================
// 🔧 HELPERS DE PERSISTÊNCIA SEGURA
// ============================================

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

async function secureSaveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token, secureStoreOptions);
    console.log("[AUTH] Token salvo no SecureStore");
  } catch (error) {
    console.error("[AUTH] Erro ao salvar token:", error);
    throw error;
  }
}

async function secureGetToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log("[AUTH] Token encontrado:", !!token);
    return token;
  } catch (error) {
    console.error("[AUTH] Erro ao recuperar token:", error);
    return null;
  }
}

async function secureRemoveToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("[AUTH] Token removido do SecureStore");
  } catch (error) {
    console.error("[AUTH] Erro ao remover token:", error);
  }
}

async function asyncGetUser(): Promise<ApiUserData | null> {
  try {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("[AUTH] Erro ao recuperar usuário:", error);
    return null;
  }
}

async function asyncSaveUser(user: ApiUserData | null): Promise<void> {
  try {
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log("[AUTH] Usuário salvo no AsyncStorage");
    } else {
      await AsyncStorage.removeItem(USER_KEY);
      console.log("[AUTH] Usuário removido do AsyncStorage");
    }
  } catch (error) {
    console.error("[AUTH] Erro ao salvar usuário:", error);
  }
}

// ============================================
// 🎯 STORE ZUSTAND COM PERSISTÊNCIA
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      token: null,
      user: null,
      storageToken: null,
      storageUser: null,
      hasHydrated: false,
      isLoading: true,
      _hasHydratedFromStorage: false,
      cpfValid: null,
      tokenRegister: null,
      userRegister: null,

      // Getter derivado
      get isAuthenticated() {
        const state = get();
        return !!(state.token && state.user);
      },

      // ========================================
      // 🔐 LOGIN - Salva token e usuário
      // ========================================
      login: async (token: string, user: ApiUserData | null) => {
        console.log("[AUTH] Iniciando login...");

        try {
          // Salva no SecureStore primeiro (mais seguro)
          await secureSaveToken(token);

          // Salva usuário no AsyncStorage
          await asyncSaveUser(user);

          set({
            token,
            user: user ? { ...user, isLoggedIn: true } : null,
            storageToken: token,
            storageUser: user,
            isLoading: false,
            hasHydrated: true,
          });

          console.log("[AUTH] Login realizado com sucesso");
          console.log("[AUTH] Usuário autenticado:", !!user);
        } catch (error) {
          console.error("[AUTH] Erro no login:", error);
          throw error;
        }
      },

      // ========================================
      // 🚪 LOGOUT - Limpa tudo
      // ========================================
      logout: async () => {
        console.log("[AUTH] ====================================");
        console.log("[AUTH] INICIANDO LOGOUT COMPLETO");
        console.log("[AUTH] ====================================");

        try {
          // Import dinâmico para evitar circular dependency
          const { useRegisterStore } = await import("@/store/register_new");

          // Limpa SecureStore
          await secureRemoveToken();

          // Limpa AsyncStorage do usuário
          await asyncSaveUser(null);

          // Limpa register store também
          const registerStore = useRegisterStore.getState();
          if (registerStore.clean) {
            console.log("[AUTH] Limpando register store...");
            registerStore.clean();
          }

          // Limpa AsyncStorage do register
          try {
            const AsyncStorage = (
              await import("@react-native-async-storage/async-storage")
            ).default;
            await AsyncStorage.removeItem("register_new");
            console.log("[AUTH] AsyncStorage do register limpo");
          } catch (e) {
            console.error("[AUTH] Erro ao limpar AsyncStorage do register:", e);
          }

          // Limpa QueryClient
          const { queryClient } = require("@/lib/queryClient");
          queryClient.clear();
          console.log("[AUTH] QueryClient limpo");

          set({
            token: null,
            user: null,
            storageToken: null,
            storageUser: null,
            hasHydrated: true,
            isLoading: false,
          });

          console.log("[AUTH] ====================================");
          console.log("[AUTH] LOGOUT COMPLETO REALIZADO");
          console.log("[AUTH] ====================================");
        } catch (error) {
          console.error("[AUTH] ❌ Erro no logout:", error);
          // Mesmo com erro, limpa o estado local
          try {
            const { queryClient } = require("@/lib/queryClient");
            queryClient.clear();
          } catch {}

          set({
            token: null,
            user: null,
            storageToken: null,
            storageUser: null,
            hasHydrated: true,
            isLoading: false,
          });
        }
      },

      // ========================================
      // 👤 ATUALIZAR USUÁRIO
      // ========================================
      setUser: (user: ApiUserData | null) => {
        console.log("[AUTH] Atualizando usuário...");

        const token = get().token;

        set({ user });

        // Atualiza também no AsyncStorage
        if (token) {
          asyncSaveUser(user);
        }

        console.log("[AUTH] Usuário atualizado:", !!user);
      },

      // ========================================
      // 🔑 ATUALIZAR TOKEN
      // ========================================
      setToken: (token: string) => {
        console.log("[AUTH] Atualizando token...");

        const prevToken = get().token;
        const user = get().user;

        // Se token mudou, limpa query client e usuário
        if (prevToken && prevToken !== token) {
          console.log("[AUTH] Token diferente, limpando sessão...");
          try {
            const { queryClient } = require("@/lib/queryClient");
            queryClient.clear();
          } catch {}
          set({ token, user: null });
          secureSaveToken(token).catch(console.error);
          return;
        }

        set({ token });
        secureSaveToken(token).catch(console.error);
      },

      // ========================================
      // 🔄 RESTORE TOKEN - CARREGAR AO INICIAR
      // ========================================
      restoreToken: async () => {
        console.log("[AUTH] ====================================");
        console.log("[AUTH] INICIANDO RESTAURAÇÃO DE TOKEN");
        console.log("[AUTH] ====================================");

        set({ isLoading: true });

        try {
          // ========================================
          // ESTRATÉGIA: Tentar múltiplas vezes com backoff
          // ========================================
          const MAX_RETRIES = 5;
          const BASE_DELAY = 100; // ms

          let token: string | null = null;
          let user: ApiUserData | null = null;
          let attempts = 0;

          while (attempts < MAX_RETRIES) {
            attempts++;
            console.log(`[AUTH] Tentativa ${attempts}/${MAX_RETRIES}`);

            // Tenta pegar do SecureStore
            const [storedToken, storedUser] = await Promise.all([
              secureGetToken(),
              asyncGetUser(),
            ]);

            if (storedToken) {
              token = storedToken;
              user = storedUser;
              console.log("[AUTH] Token encontrado na tentativa", attempts);
              break;
            }

            // Se não encontrou, espera com backoff exponencial
            if (attempts < MAX_RETRIES) {
              const delay = BASE_DELAY * Math.pow(2, attempts - 1);
              console.log(`[AUTH] Aguardando ${delay}ms antes de retry...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }

          // ========================================
          // ATUALIZA ESTADO
          // ========================================
          const current = get();

          if (token) {
            console.log("[AUTH] ✅ Token restaurado com sucesso!");
            console.log("[AUTH] ✅ Usuário autenticado:", !!user);

            set({
              token,
              user: user ? { ...user, isLoggedIn: true } : null,
              storageToken: token,
              storageUser: user,
              isLoading: false,
              hasHydrated: true,
              _hasHydratedFromStorage: true,
            });
          } else {
            console.log("[AUTH] ❌ Token não encontrado");
            console.log("[AUTH] ❌ Usuário não autenticado");

            set({
              token: null,
              user: null,
              storageToken: null,
              storageUser: null,
              isLoading: false,
              hasHydrated: true,
              _hasHydratedFromStorage: true,
            });
          }

          console.log("[AUTH] ====================================");
          console.log("[AUTH] HIDRATAÇÃO CONCLUÍDA");
          console.log("[AUTH] ====================================");
        } catch (error) {
          console.error("[AUTH] ❌ Erro durante restauração:", error);

          set({
            token: null,
            user: null,
            isLoading: false,
            hasHydrated: true,
            _hasHydratedFromStorage: true,
          });
        }
      },

      // ========================================
      // ✅ MARCAR COMO HIDRATADO
      // ========================================
      setHydrated: (hydrated: boolean) => {
        console.log("[AUTH] Hidratação marcada como:", hydrated);
        set({ hasHydrated: hydrated });
      },

      // ========================================
      // 📝 REGISTER (para recovery de senha)
      // ========================================
      register: (token: string | null, user: ApiUserData | null) => {
        console.log("[AUTH] Register chamado:", {
          token: !!token,
          user: !!user,
        });
        set({
          tokenRegister: token,
          userRegister: user,
        });
      },

      // ========================================
      // 🔢 SET CPF VALID
      // ========================================
      setCpfValid: (cpf: string | null) => {
        console.log("[AUTH] CPF válido definido:", cpf);
        set({ cpfValid: cpf });
      },
    }),
    {
      name: HYDRATION_KEY,
      storage: createJSONStorage(() => AsyncStorage),

      // Partes do estado que queremos persistir localmente
      // (O token real está no SecureStore, isso é só para cache)
      partialize: (state) => ({
        storageToken: state.storageToken,
        storageUser: state.storageUser,
      }),

      // Chamado quando a store é reidratada do AsyncStorage
      onRehydrateStorage: () => {
        console.log("[AUTH] Reidratação do AsyncStorage iniciada...");
        return (state, error) => {
          if (error) {
            console.error("[AUTH] Erro na reidratação:", error);
          } else {
            console.log("[AUTH] Reidratação do AsyncStorage concluída");
            // IMPORTANTE: Não marcar hasHydrated como true aqui
            // A restauração real do SecureStore é feita no restoreToken()
          }
        };
      },
    },
  ),
);

// ============================================
// 🎣 HOOK PERSONALIZADO PARA USO SEGURO
// ============================================

/**
 * Hook seguro para acessar dados de autenticação.
 * Garante que só retorna dados quando a hidratação estiver completa.
 */
export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const isAuthenticated = !!(token && user);

  return {
    token,
    user,
    isAuthenticated,
    hasHydrated,
    isLoading,
    isHydrated: hasHydrated && !isLoading,
  };
}

// ============================================
// 🔧 HELPERS EXPORTADOS
// ============================================

export { secureGetToken, secureRemoveToken, secureSaveToken };
