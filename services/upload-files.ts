import { api } from "@/services/api";

export const solicitarLinkS3 = async (filename: any, contentType: any) => {
  try {
    const response = await api.post("/v1/generate-presigned-url", {
      filename: filename,
      content_type: contentType,
    });

    return response.data;
  } catch (error: any) {
    throw error;
  }
};
