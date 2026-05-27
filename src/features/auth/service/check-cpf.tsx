import api from "@/shared/service/api";

export async function CheckCPFService(
  cpf: string,
  birthDate?: string,
): Promise<{ data: { type: string }; message: string; success: boolean }> {
  try {
    const response = await api.get(`/auth/info-cpf`, {
      params: { cpf, birthdate: birthDate },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
