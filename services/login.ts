import type { PostHogEventProperties } from "@posthog/core";

import { ApiUserResponse } from "@/interfaces/login_inteface";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import { api, withAnalytics } from "./api";

export async function login(
  cpf: string,
  password: string,
  analyticsContext?: PostHogEventProperties,
): Promise<ApiUserResponse> {
  const pushToken = useNotificationsStore.getState().pushToken;

  try {
    useRegisterStore.getState().setToken(null);

    const response = await api.post(
      `/auth/login-app`,
      {
        cpf,
        password,
        pushToken,
      },
      withAnalytics(analyticsContext ?? {}),
    );

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
