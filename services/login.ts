import { useNotificationsStore } from "@/store/notifications";
import api from "./api";
import { ApiUserResponse } from "@/interfaces/login_inteface";
import { useAuthStore } from "@/store/auth";

export async function login(
  cpf: string,
  password: string,
): Promise<ApiUserResponse> {
  const pushToken = useNotificationsStore.getState().pushToken;
  const { register } = useAuthStore.getState();

  try {
    register(null, null);
    const response = await api.post(`/auth/login`, {
      cpf,
      password,
      pushToken,
    });

    const responseSettings = await api.get("v1/register/settings", {
      headers: {
        Authorization: `Bearer ${response.data.data.token}`,
      },
    });

    return {
      ...response.data.data,
      ...responseSettings.data.data,
    };
  } catch (error: any) {
    console.log("erro login", error.response);
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
