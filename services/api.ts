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

const DEVICE_UUID_KEY = "device_uuid";
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

interface RetryRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  analyticsContext?: PostHogEventProperties;
  skipErrorTracking?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
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
    console.error("UUID Error:", error);

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

function getAuthToken() {
  const authStore = useAuthStore.getState();
  const registerStore = useRegisterStore.getState();

  return registerStore.token || authStore.token;
}

function getPushToken() {
  return useNotificationsStore.getState().pushToken;
}

function logoutUser() {
  const authStore = useAuthStore.getState();
  const registerStore = useRegisterStore.getState();

  if (registerStore.token) {
    registerStore.clean();
    router.replace("/login");
    return;
  }

  if (authStore.token) {
    authStore.logout();
    router.replace("/login");
    return;
  }

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
    {
      text: "OK",
      onPress: logoutUser,
    },
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

  console.log("code", code);
  console.log("erro", erro);

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
    const securityHeaders = await createSecurityHeaders();

    const token = getAuthToken();

    Object.assign(config.headers, {
      ...config.headers,
      ...securityHeaders,
      "X-PUSH": getPushToken() || "",
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/* -------------------------------------------------------------------------- */
/*                            RESPONSE INTERCEPTOR                            */
/* -------------------------------------------------------------------------- */

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError<any>) => {
    const originalRequest = error.config as RetryRequestConfig;

    const status = error.response?.status;
    const message = error.response?.data?.message;
    const blockMessage =
      typeof error.response?.data?.erro === "string"
        ? error.response?.data?.erro
        : undefined;

    const hasToken = !!getAuthToken();

    console.log("status", status);
    console.log("error", error.response);
    console.log("message", message);

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

    if (
      status === 401 &&
      hasToken &&
      message !== "Unauthorised." &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      showSessionExpiredAlert();
    } else if (status === 403) {
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
    } else if (status === 429 && message?.startsWith("Aguarde")) {
      return Promise.reject(error);
    } else if (status === 429) {
      showRateLimitAlert("Muitas requisições na mesma rota");
    } else if (status && status >= 500) {
      showServerErrorAlert();
    } else if (error.code === "ECONNABORTED") {
      console.log("Timeout", error);
      showTimeoutAlert();
    } else if (!error.response) {
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
    await api.get("/health");

    return true;
  } catch {
    return false;
  }
}

export default api;
