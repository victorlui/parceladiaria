import { useAuthStore } from "@/store/auth";
import api from "./api";
import { Etapas } from "@/utils";
import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// etapa para criar a senha
export async function registerService(
  cpf: string,
  phone: string,
  password: string
): Promise<{ data: { token: string }; success: boolean } | undefined> {
  if (phone.length !== 11) {
    throw {
      status: 400,
      message: "Telefone inválido",
    };
  }

  try {
    const response = await api.post("/auth/register", {
      cpf,
      password,
      phone: phone,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      let errorMessage =
        error.response.data.message || "Erro durante o registro";

      if (error.response.status === 409) {
        throw {
          status: 409,
          message: "Usuário já cadastrado. Faça login com suas credenciais.",
          data: error.response.data,
          isExistingUser: true,
        };
      }

      if (error.response.data.data) {
        const errorData = error.response.data.data;

        if (errorData.cpf) {
          errorMessage = `Erro no CPF: ${errorData.cpf.join(", ")}`;
        } else if (errorData.phone) {
          errorMessage = `Erro no telefone: ${errorData.phone.join(", ")}`;
        } else if (errorData.password) {
          errorMessage = `Erro na senha: ${errorData.password.join(", ")}`;
        }
      }
      throw {
        status: error.response.status,
        message: errorMessage,
        data: error.response.data,
      };
    }
  }
}

// etapa para atualizar a data de nascimento
type RequestProps = {
  request: any;
};

export async function updateUserService({ request }: RequestProps): Promise<{
  message: string;
  success: boolean;
  etapa: Etapas;
}> {
  try {
    const token = useAuthStore.getState().tokenRegister;
    console.log("token", token);
    if (!token) {
      throw new Error("Token não encontrado");
    }

    const { data } = await api.put("/v1/client/update", request, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { ...data, success: true, etapa: request.etapa };
  } catch (error: any) {
    console.log("error update", error.response);
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data?.message || "Erro ao atualizar os dados",
        data: error.response.data,
      };
    }
    throw error;
  }
}
