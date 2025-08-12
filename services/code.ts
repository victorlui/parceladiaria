import api from "./api";

export async function sendCode(
  phone: string,
  method: string
): Promise<{ data: { phone: string }; message: string; success: boolean }> {
  try {
    const response = await api.post("/auth/otp/generate", {
      phone,
      method,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao enviar codigo:", error);
    throw error;
  }
}

//verificar código
export async function checkOTP(
  phone: string,
  code: string
): Promise<
  { data: { otp: string }; message: string; success: boolean } | undefined
> {
  try {
    const response = await api.post("/auth/otp/check", {
      phone,
      otp: code,
    });
    
    return response.data;  

  } catch (error: any) {
    if (error.response) {
      throw {
        status: error.response.status,
        message:
          (error.response.data && error.response.data.message) ||
          "Código inválido ou expirado",
        data: error.response.data,
      };
    }
    return error
    
  }
}
