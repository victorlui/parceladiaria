import api from "./api";
import { ApiUserResponse } from "@/interfaces/login_inteface";

export async function login(cpf: string, password: string): Promise<ApiUserResponse> {
  try {
    const response = await api.post(`/auth/login`, {
      cpf,
      password,
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data?.message || "Erro ao atualizar os dados",
        data: error.response.data,
      };
    } else {
      throw {
        status: 500,
        message: error.message || "Erro ao atualizar os dados",
        data: error,
      };
    }
  }
}
