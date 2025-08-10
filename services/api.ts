import { useAuthStore } from "@/store/auth";
import axios, { AxiosError } from "axios";
const BASE_URL = "https://app.parceladiaria.com.br/api";
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});



api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
   (error: AxiosError) => {
     console.log("error request", error.response);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    console.log("error response", error.response);
    if (error.status === 401) {
       const token = useAuthStore.getState().token;
      console.log('token response',token)
       // const response = await api.post("v1/renew", {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      
    }

    return Promise.reject(error);
  }
);

export default api;
