import api from "./api";

export async function changePixKey(pixKey: string, type: string) {
  try {
    const { data } = await api.get("/v1/search/dict", {
      params: {
        pixKey,
        type,
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
}
