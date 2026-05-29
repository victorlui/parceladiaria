import { ApiUserResponse } from "@/interfaces/login_inteface";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import api from "./api";

export async function login(
  cpf: string,
  password: string,
): Promise<ApiUserResponse> {
  const pushToken = useNotificationsStore.getState().pushToken;
  const { register } = useAuthStore.getState();

  try {
    register(null, null);
    useRegisterStore.getState().setToken(null);

    const response = await api.post(`/auth/login-app`, {
      cpf,
      password,
      pushToken,
    });

    const data = response.data.data;

    return data;
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
