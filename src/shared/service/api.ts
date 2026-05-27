import { AxiosInstance, create } from "axios";
import { useAlertStore } from "../store/useAlertStore";
import { useNotificationsStore } from "../store/useNotificationsStore";
import { createSecurityHeaders } from "../utils/header";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api: AxiosInstance = create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function getPushToken() {
  return useNotificationsStore.getState().pushToken;
}

api.interceptors.request.use(
  async (config) => {
    const securityHeaders = await createSecurityHeaders();

    Object.assign(config.headers, {
      ...config.headers,
      ...securityHeaders,
      "X-PUSH": getPushToken() || "",
    });

    return config;
  },
  (error) => {
    console.log("error request", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    console.log("response api", response);
    return response;
  },
  (error) => {
    console.log("error response", error.response.data);

    const errorMessage =
      error.response?.data?.data?.mensagem ||
      error.response?.data?.data?.error ||
      error.response?.data?.error ||
      "Ocorreu um erro inesperado ao conectar com o servidor.";

    useAlertStore.getState().showAlert("error", "Atenção!!", errorMessage);

    return Promise.reject(error);
  },
);

export default api;
