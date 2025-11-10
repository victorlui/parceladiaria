import { useAuthStore } from "@/store/auth";
import api from "./api";

interface TermsAcceptanceData {
  sign_info_date: string;
  sign_info_ip_address: string;
  sign_info_city: string;
  sign_info_state: string;
  sign_info_country: string;
}

export async function acceptedTerms(data: TermsAcceptanceData) {
  const token = useAuthStore.getState().tokenRegister;
  try {
    const response = await api.post("/v1/client/acept-term", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.log("Error ao aceitar os termos:", error.response);
    throw error;
  }
}
