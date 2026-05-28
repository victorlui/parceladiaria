import api from "@/shared/service/api";
import { Etapas } from "@/shared/utils/etapas";

export async function UpdateUserService({ request }: any): Promise<{
  message: string;
  success: boolean;
  etapa: Etapas;
}> {
  try {
    const { data } = await api.put("/v1/client/update", request);
    return { ...data, success: true, etapa: request.etapa };
  } catch (error: any) {
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
