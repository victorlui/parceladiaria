import api from "./api";

export async function changePixKey(pixKey: string, type: string) {
  const normalizedType = type === "random" ? "evp" : type;

  try {
    const { data } = await api.get("/v1/search/dict", {
      params: {
        pixKey,
        type: normalizedType,
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
}
