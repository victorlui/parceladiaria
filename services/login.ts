import axios from "axios";
import api from "./api";
import { ApiUserResponse } from "@/interfaces/login_inteface";
import { useAuthStore } from "@/store/auth";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function login(cpf: string, password: string): Promise<ApiUserResponse> {
  try {
    const response = await api.post(`/auth/login`, {
      cpf,
      password,
    });
   
    // const response_token = await axios.post(
    //   `${BASE_URL}/v1/client/renew`,
    //   {}, // body vazio ou dados necessários
    //   {
    //     headers: {
    //       "Authorization": `Bearer ${response.data.data.token}`,
    //     },
    //   }
    // );
   
    

    // console.log('novo token',{token:response_token.data.data.token,...response.data.data})


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
