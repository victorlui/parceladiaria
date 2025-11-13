import { Alert } from "react-native";
import { solicitarLinkS3 } from "@/services/upload-files";
import { useAuthStore } from "@/store/auth";

type UploadFileParams = {
  file: {
    uri: string;
    name?: string;
    mimeType?: string;
  };
};

export async function uploadFileToS3({ file }: UploadFileParams) {
  const tokenRegister = useAuthStore.getState().tokenRegister;
  try {
    const mimeType = file.mimeType || "image/jpeg";
    const isVideo = mimeType.startsWith("video/");
    const filename = file.name || (isVideo ? "video.mp4" : "arquivo.jpg");

    const response = await fetch(file.uri);
    const blob = await response.blob();

    const fileSize = blob.size;
    if (!isVideo && fileSize > 10 * 1024 * 1024) {
      Alert.alert("Arquivo muito grande (máx. 10MB)");
      return null;
    }

    const { upload_url, final_url } = await solicitarLinkS3(
      filename,
      mimeType,
      tokenRegister
    );

    const uploadResult = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": mimeType },
      body: blob,
    });

    if (!uploadResult.ok) {
      throw new Error(`Falha no upload. Status: ${uploadResult.status}`);
    }

    return final_url;
  } catch (error) {
    Alert.alert("Erro no upload", "Não foi possível enviar o arquivo.");
    return null;
  }
}
