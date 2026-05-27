import api from "@/shared/service/api";
import { useNotificationsStore } from "@/shared/store/useNotificationsStore";

interface Props {
  cpf: string;
  password: string;
}

export async function LoginService({ cpf, password }: Props): Promise<any> {
  const pushToken = useNotificationsStore.getState().pushToken;

  try {
    const response = await api.post(`/auth/login-app`, {
      cpf,
      password,
      pushToken,
    });

    const data = response.data.data;

    return data;
  } catch (error: any) {
    throw error;
  }
}
