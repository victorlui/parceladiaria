import api from "./api";

export async function checkCPF(
  cpf: string
): Promise<{ data: { type: string }; message: string; success: boolean }> {
  try {
    const response = await api.get(`/auth/info-cpf`, {
      params: { cpf },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao verificar CPF:", error);
    throw error;
  }
}
