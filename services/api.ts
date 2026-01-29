import { useAuthStore } from "@/store/auth";
import { generateSignature } from "@/utils";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { router } from "expo-router";
import Constants from "expo-constants";
import { Alert } from "react-native";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

// Tipos para melhor tipagem
interface ApiConfig {
  baseURL: string;
  secret: string;
}

interface ApiHeaders {
  "Content-Type": string;
  "X-Signature": string;
  "X-UUID": string;
  "X-Timestamp": string;
  Authorization?: string;
  "X-UserAgent": string;
  "X-Version-app": string;
}

// Configuração da API
const apiConfig: ApiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || "",
  secret: process.env.EXPO_PUBLIC_SECRET || "",
};

// Validação das variáveis de ambiente
if (!apiConfig.baseURL || !apiConfig.secret) {
  throw new Error("Variáveis de ambiente da API não configuradas corretamente");
}

// Função para obter ou gerar UUID único do dispositivo
const getDeviceUUID = async (): Promise<string> => {
  try {
    let uuid = await SecureStore.getItemAsync("device_uuid");
    if (!uuid) {
      uuid = Crypto.randomUUID();
      await SecureStore.setItemAsync("device_uuid", uuid);
    }
    return uuid;
  } catch (error) {
    console.error("Erro ao gerenciar UUID do dispositivo:", error);
    return Crypto.randomUUID();
  }
};

// Função para gerar headers dinâmicos
const generateHeaders = async (): Promise<Partial<ApiHeaders>> => {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  try {
    const uuid = await getDeviceUUID();
    const signature = await generateSignature(
      uuid,
      apiConfig.secret,
      timestamp
    );

    return {
      "Content-Type": "application/json",
      "X-Signature": signature,
      "X-UUID": uuid,
      "X-Timestamp": timestamp,
      "X-UserAgent": "mobile",
      "X-Version-app": Constants.expoConfig?.version ?? "1.0.0",
    };
  } catch (error) {
    console.error("Erro ao gerar assinatura:", error);
    throw new Error("Falha na autenticação da API");
  }
};

// Criação da instância do axios
const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: 30000, // 30 segundos de timeout
});

// Interceptor de requisição melhorado
api.interceptors.request.use(
  async (config: any) => {
    try {
      // Gera headers dinâmicos para cada requisição
      const dynamicHeaders = await generateHeaders();

      // Garante que headers não seja undefined antes do merge
      config.headers = {
        ...(config.headers || {}),
        ...dynamicHeaders,
      };

      // Adiciona token de autenticação se disponível
      const token =
        useAuthStore.getState().token || useAuthStore.getState().tokenRegister;
      console.log("token api", token);
      if (token) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error("Erro no interceptor de requisição:", error);
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    console.error("Erro na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta melhorado
// Dentro de: api.interceptors.response.use(...)
(api.interceptors.response.use as any)(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const token = useAuthStore.getState().token;

    if (!token) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      error.response.data.message !== "Unauthorised."
    ) {
      // Evita loop infinito de retry
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        Alert.alert("Sessão expirada", "Por favor, faça login novamente.", [
          {
            text: "OK",
            onPress: () => {
              useAuthStore.getState().logout();
              router.replace("/login");
            },
          },
        ]);
      }
    } else if (error.response && error.response.status >= 500) {
      Alert.alert(
        "Erro do servidor",
        "Ocorreu um erro interno. Tente novamente mais tarde."
      );
    } else if (error.code === "ECONNABORTED") {
      Alert.alert(
        "Timeout",
        "A requisição demorou muito para responder. Verifique sua conexão."
      );
    } else if (!error.response) {
      Alert.alert(
        "Erro de conexão",
        "Verifique sua conexão com a internet e tente novamente."
      );
    }

    return Promise.reject(error);
  }
);

// Função utilitária para retry automático
export const apiWithRetry = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<AxiosResponse<T>> => {
  let lastError: AxiosError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as AxiosError;

      // Não faz retry para erros 4xx (exceto 408 - timeout)
      if (
        lastError.response?.status &&
        lastError.response.status >= 400 &&
        lastError.response.status < 500 &&
        lastError.response.status !== 408
      ) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Delay exponencial
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }

  throw lastError!;
};

// Função para verificar saúde da API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await api.get("/health");
    return true;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
};

export default api;
