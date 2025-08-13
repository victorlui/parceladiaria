import { AxiosError } from "axios";
import api from "./api";
import { useAuthStore } from "@/store/auth";
import { router } from "expo-router";

interface TermsAcceptanceData {
  sign_info_date: string;
  sign_info_ip_address: string;
  sign_info_city: string;
  sign_info_state: string;
  sign_info_country: string;
}

export async function acceptedTerms(data: TermsAcceptanceData) {
  try {
    const response = await api.post('/v1/client/acept-term', data);
    return response;
  } catch (error) {
     if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        router.replace("/login");
      }
    }
    throw error;
  }
}