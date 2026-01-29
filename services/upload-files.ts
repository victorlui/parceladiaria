import { router } from "expo-router";
import api from "./api";

export const solicitarLinkS3 = async (
  filename: any,
  contentType: any,
  token: any
) => {
  console.log("solicitarLinkS3", {
    filename: filename,
    content_type: contentType,
  });
  try {
    const response = await api.post(
      "/v1/generate-presigned-url",
      {
        filename: filename,
        content_type: contentType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("solicitarLinkS3", response.data);
    return response.data;
  } catch (error: any) {
    console.log("error solicitar", error.response);
    if (error.response && error.response.status === 401) {
      router.replace("/login");
    }
  }
};

export const uploadArquivoParaS3 = async (
  uploadUrl: any,
  arquivo: any,
  contentType: any
) => {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: arquivo,
      headers: {
        "Content-Type": contentType,
      },
    });
    if (!response.ok) {
      throw new Error(`Upload falhou com status: ${response.status}`);
    }
    return true;
  } catch (error: any) {
    throw error;
  }
};
