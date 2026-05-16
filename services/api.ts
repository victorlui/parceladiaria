import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import { Alert } from "react-native";
import { router } from "expo-router";

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
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

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
    router.replace("/(register)/step1");
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
  Alert.alert("Sessão expirada", "Sua sessão expirou.", [
    {
      text: "OK",
      onPress: logoutUser,
    },
  ]);
}

function showServerErrorAlert() {
  Alert.alert(
    "Erro do servidor",
    "Ocorreu um erro interno. Tente novamente mais tarde.",
  );
}

function showTimeoutAlert() {
  Alert.alert("Timeout", "A requisição demorou muito para responder.");
}

function showConnectionErrorAlert() {
  Alert.alert("Erro de conexão", "Verifique sua internet e tente novamente.");
}

/* -------------------------------------------------------------------------- */
/*                            REQUEST INTERCEPTOR                             */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use(
  async (config) => {
    const securityHeaders = await createSecurityHeaders();

    const token = getAuthToken();

    config.headers = {
      ...config.headers,
      ...securityHeaders,
      "X-PUSH": getPushToken() || "",
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
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

    const hasToken = !!getAuthToken();

  

    if (
      status === 401 &&
      hasToken &&
      message !== "Unauthorised." &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      showSessionExpiredAlert();
    } else if (status && status >= 500) {
      showServerErrorAlert();
    } else if (error.code === "ECONNABORTED") {
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
