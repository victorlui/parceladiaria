import { trackApiAlertShown, trackApiError } from "@/analytics/error-handler";
import { ANALYTICS_SOURCES, API_ALERT_TYPES } from "@/analytics/events";
import type { PostHogEventProperties } from "@posthog/core";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import { router } from "expo-router";
import { Alert } from "react-native";

import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";

import { generateSignature } from "@/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_SECRET = process.env.EXPO_PUBLIC_SECRET;

if (!API_URL || !API_SECRET) {
  throw new Error("API environment variables are missing.");
}

// ============================================
// 🔐 CONSTANTES E CONFIGURAÇÃO
// ============================================
const DEVICE_UUID_KEY = "device_uuid";
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

// ============================================
// 🔄 SISTEMA DE FILA DE REQUISIÇÕES
// ============================================

interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: AxiosResponse) => void;
  reject: (error: any) => void;
}

let requestQueue: QueuedRequest[] = [];
let isProcessingQueue = false;
let hydrationPromise: Promise<void> | null = null;

// ============================================
// 🎯 GARANTIR HIDRATAÇÃO ANTES DE REQUISIÇÕES
// ============================================

export async function ensureAuthHydrated(): Promise<void> {
  const authStore = useAuthStore.getState();

  // Se já hidratou, retorna imediatamente
  if (authStore.hasHydrated && !authStore.isLoading) {
    console.log("[API] Auth já hidratado, continuando...");
    return;
  }

  // Se já está aguardando, usa a mesma promise
  if (hydrationPromise) {
    console.log("[API] Aguardando hidratação em progresso...");
    return hydrationPromise;
  }

  // Cria promise de hidratação
  console.log("[API] Iniciando hidratação para requisição...");

  hydrationPromise = new Promise((resolve) => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.hasHydrated && !state.isLoading) {
        console.log("[API] ✅ Hidratação concluída!");
        unsubscribe();
        hydrationPromise = null;
        resolve();
      }
    });

    // Timeout de segurança (5 segundos)
    setTimeout(() => {
      console.log("[API] ⏰ Timeout de hidratação!");
      unsubscribe();
      hydrationPromise = null;
      resolve();
    }, 5000);
  });

  return hydrationPromise;
}

// Processa fila de requisições após hidratação
async function processRequestQueue(): Promise<void> {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  console.log(
    `[API] Processando ${requestQueue.length} requisições na fila...`,
  );

  while (requestQueue.length > 0) {
    const request = requestQueue.shift()!;

    try {
      const response = await api.request(request.config);
      request.resolve(response);
    } catch (error) {
      request.reject(error);
    }
  }

  isProcessingQueue = false;
}

// Adiciona requisição à fila
async function enqueueRequest<T>(
  config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      config,
      resolve: resolve as any,
      reject,
    });

    processRequestQueue();
  });
}

interface RetryRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  analyticsContext?: PostHogEventProperties;
  skipErrorTracking?: boolean;
  _skipHydration?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export function withAnalytics(
  analyticsContext: PostHogEventProperties,
  config: AxiosRequestConfig = {},
): RetryRequestConfig {
  return {
    ...config,
    analyticsContext,
  };
}

function buildAnalyticsContext(
  properties: Record<string, unknown>,
): PostHogEventProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as PostHogEventProperties;
}

/* -------------------------------------------------------------------------- */
/*                               DEVICE UUID                                  */
/* -------------------------------------------------------------------------- */

async function getDeviceUUID(): Promise<string> {
  try {
    const storedUUID = await SecureStore.getItemAsync(DEVICE_UUID_KEY);

    if (storedUUID) {
      return storedUUID;
    }

    const newUUID = Crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_UUID_KEY, newUUID);

    return newUUID;
  } catch (error) {
    console.error("[UUID] Erro:", error);
    return Crypto.randomUUID();
  }
}

/* -------------------------------------------------------------------------- */
/*                               AUTH HEADERS                                 */
/* -------------------------------------------------------------------------- */

async function createSecurityHeaders() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const uuid = await getDeviceUUID();
  const signature = await generateSignature(uuid, API_SECRET!, timestamp);

  return {
    "X-Signature": signature,
    "X-UUID": uuid,
    "X-Timestamp": timestamp,
    "X-UserAgent": "mobile",
    "X-Version-app": APP_VERSION,
  };
}

/* -------------------------------------------------------------------------- */
/*                                STORE HELPERS                               */
/* -------------------------------------------------------------------------- */

function getAuthToken(): string | null {
  const authStore = useAuthStore.getState();
  const registerStore = useRegisterStore.getState();

  return registerStore.token || authStore.token;
}

function getPushToken(): string | null {
  return useNotificationsStore.getState().pushToken;
}

function isAuthHydrated(): boolean {
  const authStore = useAuthStore.getState();
  return authStore.hasHydrated && !authStore.isLoading;
}

function logoutUser() {
  console.log("[API] Iniciando logout por inatividade/token expirado...");

  const authStore = useAuthStore.getState();
  const registerStore = useRegisterStore.getState();

  if (registerStore.token) {
    console.log("[API] Limpando store de registro...");
    registerStore.clean();
  }

  if (authStore.token) {
    console.log("[API] Limpando store de autenticação...");
    authStore.logout();
  }

  console.log("[API] Redirecionando para login...");
  router.replace("/login");
}

/* -------------------------------------------------------------------------- */
/*                               ALERT HELPERS                                */
/* -------------------------------------------------------------------------- */

function showSessionExpiredAlert() {
  trackApiAlertShown(
    API_ALERT_TYPES.SESSION_EXPIRED,
    "Sessão expirada",
    "Sua sessão expirou.",
  );

  Alert.alert("Sessão expirada", "Sua sessão expirou.", [
    { text: "OK", onPress: logoutUser },
  ]);
}

function showServerErrorAlert() {
  trackApiAlertShown(
    API_ALERT_TYPES.SERVER_ERROR,
    "Erro do servidor",
    "Ocorreu um erro interno. Tente novamente mais tarde.",
  );

  Alert.alert(
    "Erro do servidor",
    "Ocorreu um erro interno. Tente novamente mais tarde.",
    [{ text: "OK", onPress: logoutUser }],
  );
}

function showTimeoutAlert() {
  trackApiAlertShown(
    API_ALERT_TYPES.TIMEOUT,
    "Timeout",
    "A requisição demorou muito para responder.",
  );

  Alert.alert("Timeout", "A requisição demorou muito para responder.", [
    { text: "OK", onPress: () => {} },
  ]);
}

function showConnectionErrorAlert() {
  trackApiAlertShown(
    API_ALERT_TYPES.CONNECTION_ERROR,
    "Erro de conexão",
    "Verifique sua internet e tente novamente.",
  );

  Alert.alert("Erro de conexão", "Verifique sua internet e tente novamente.", [
    { text: "OK", onPress: logoutUser },
  ]);
}

function showBlockedAlert(message: string) {
  trackApiAlertShown(API_ALERT_TYPES.BLOCKED, "Acesso bloqueado", message);

  Alert.alert("Acesso bloqueado", message, [
    { text: "OK", onPress: logoutUser },
  ]);
}

function showForbiddenAlert(message: string) {
  trackApiAlertShown(API_ALERT_TYPES.FORBIDDEN, "Erro", message);

  Alert.alert("Erro", message, [{ text: "OK", onPress: () => {} }]);
}

function showRateLimitAlert(message?: string) {
  const alertMessage =
    message ?? "Limite de requisições excedido. Tente novamente mais tarde.";

  trackApiAlertShown(
    API_ALERT_TYPES.RATE_LIMIT,
    "Limite de requisições",
    alertMessage,
  );

  Alert.alert("Limite de requisições", alertMessage, [
    { text: "OK", onPress: () => {} },
  ]);
}

function getBlockedReasonFromErro(erro?: string): string | undefined {
  if (!erro) return undefined;

  const normalized = erro.trim();

  if (
    normalized ===
    "Você atingiu o limite de tentativas hoje. Tente novamente amanhã."
  ) {
    return "Excesso de tentativas de OTP no dia";
  }

  const match = normalized.match(/#(\d+)/);
  const code = match?.[1];

  switch (code) {
    case "990":
      return "Login via site (origem indevida)";
    case "991":
      return "Login-web via app (origem indevida)";
    case "100":
      return "Tente novamente em 24 Horas";
    case "0":
      return "User-Agent inválido/suspeito";
    case "1":
      return "Falta header de assinatura";
    case "2":
      return "Assinatura expirada (relógio fora)";
    case "3":
      return "Assinatura inválida";
    default:
      return undefined;
  }
}

/* -------------------------------------------------------------------------- */
/*                            REQUEST INTERCEPTOR                             */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use(
  async (config) => {
    const requestConfig = config as RetryRequestConfig;

    console.log(
      `[API] 📤 REQUEST: ${config.method?.toUpperCase()} ${config.url}`,
    );

    // ========================================
    // BLOQUEAR REQUISIÇÕES ANTES DA HIDRATAÇÃO
    // ========================================
    if (!requestConfig._skipHydration) {
      const authHydrated = isAuthHydrated();
      const hasToken = !!getAuthToken();

      if (!authHydrated || !hasToken) {
        console.log("[API] 📤 Aguardando hidratação antes de processar...");
        await ensureAuthHydrated();
      }
    }

    // ========================================
    // ADICIONA HEADERS DE SEGURANÇA
    // ========================================
    const securityHeaders = await createSecurityHeaders();

    Object.assign(config.headers, {
      ...config.headers,
      ...securityHeaders,
      "X-PUSH": getPushToken() || "",
    });

    // ========================================
    // ADICIONA TOKEN DE AUTORIZAÇÃO
    // ========================================
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("[API] ❌ Erro no interceptor de request:", error);
    return Promise.reject(error);
  },
);

/* -------------------------------------------------------------------------- */
/*                            RESPONSE INTERCEPTOR                            */
/* -------------------------------------------------------------------------- */

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API] ✅ RESPONSE: ${response.status} ${response.config.url}`);
    return response;
  },

  async (error: AxiosError<any>) => {
    const originalRequest = error.config as RetryRequestConfig;

    console.log(
      `[API] ❌ RESPONSE ERROR: ${error.response?.status} ${originalRequest?.url}`,
    );

    const status = error.response?.status;
    const message = error.response?.data?.message;
    const blockMessage =
      typeof error.response?.data?.erro === "string"
        ? error.response?.data?.erro
        : undefined;

    const hasToken = !!getAuthToken();

    // ========================================
    // TRACKING DE ERROS
    // ========================================
    if (!originalRequest?.skipErrorTracking) {
      trackApiError(
        error,
        buildAnalyticsContext({
          source: ANALYTICS_SOURCES.API_INTERCEPTOR,
          endpoint: originalRequest?.url,
          method: originalRequest?.method?.toUpperCase(),
          base_url: originalRequest?.baseURL,
          ...originalRequest?.analyticsContext,
        }),
      );
    }

    // ========================================
    // TRATAMENTO DE 401 - TOKEN INVÁLIDO/EXPIRADO
    // ========================================
    if (
      status === 401 &&
      hasToken &&
      message !== "Unauthorised." &&
      !originalRequest?._retry
    ) {
      console.log("[API] ❌ 401 Unauthorized - Token inválido/expirado");

      originalRequest._retry = true;
      showSessionExpiredAlert();

      return Promise.reject(error);
    }

    // ========================================
    // TRATAMENTO DE 403 - ACESSO BLOQUEADO
    // ========================================
    if (status === 403) {
      const blockedReason = getBlockedReasonFromErro(blockMessage);

      if (blockedReason) {
        showBlockedAlert(blockedReason);
      } else if (blockMessage || message !== "Validation Error.") {
        showForbiddenAlert(blockMessage ?? message);
      } else if (!blockMessage && message === "Validation Error.") {
        return Promise.reject(error);
      } else {
        showForbiddenAlert("Requisição não autorizada.");
      }
    }

    // ========================================
    // TRATAMENTO DE 429 - RATE LIMIT
    // ========================================
    if (status === 429 && message?.startsWith("Aguarde")) {
      return Promise.reject(error);
    } else if (status === 429) {
      showRateLimitAlert("Muitas requisições na mesma rota");
    }

    // ========================================
    // TRATAMENTO DE ERROS 5xx
    // ========================================
    if (status && status >= 500) {
      showServerErrorAlert();
    }

    // ========================================
    // TRATAMENTO DE TIMEOUT
    // ========================================
    if (error.code === "ECONNABORTED") {
      console.log("[API] ❌ Timeout");
      showTimeoutAlert();
    }

    // ========================================
    // TRATAMENTO DE ERRO DE CONEXÃO
    // ========================================
    if (!error.response) {
      console.log("[API] ❌ Erro de conexão (sem resposta)");
      showConnectionErrorAlert();
    }

    return Promise.reject(error);
  },
);

/* -------------------------------------------------------------------------- */
/*                                  RETRY                                     */
/* -------------------------------------------------------------------------- */

export async function apiWithRetry<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  retries = 3,
  baseDelay = 1000,
): Promise<AxiosResponse<T>> {
  let lastError: AxiosError | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as AxiosError;

      const status = lastError.response?.status;

      const isClientError =
        status && status >= 400 && status < 500 && status !== 408;

      if (isClientError) {
        throw lastError;
      }

      const delay = baseDelay * 2 ** attempt;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/* -------------------------------------------------------------------------- */
/*                                HEALTH CHECK                                */
/* -------------------------------------------------------------------------- */

export async function checkApiHealth(): Promise<boolean> {
  try {
    await api.get("/health", { _skipHydration: true } as any);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// 🎯 MÉTODO CUSTOMIZADO COM QUEUE
// ============================================

export async function apiWithQueue<T>(
  config: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  const requestConfig = config as RetryRequestConfig;

  if (requestConfig._skipHydration) {
    return api.request<T>(config);
  }

  await ensureAuthHydrated();

  return api.request<T>(config);
}

// ============================================
// 🔧 EXPORTAR HELPERS
// ============================================

export { api, isAuthHydrated };
