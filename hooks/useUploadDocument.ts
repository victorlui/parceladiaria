import { solicitarLinkS3 } from "@/services/upload-files";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

type UploadFileParams = {
  file: {
    uri: string;
    name?: string;
    mimeType?: string;
  };
};

export async function uploadFileToS3({ file }: UploadFileParams) {
  // 1. Verifica tamanho
  const fileInfo:any = await FileSystem.getInfoAsync(file.uri);
  const mimeType = file.mimeType || "image/jpeg";
  
  // Skip size validation for video files
  const isVideo = mimeType.startsWith('video/');
  if (!isVideo && fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
    Alert.alert("Arquivo muito grande (máx. 10MB)");
    return null;
  }

  // 2. Nome e tipo
  const filename = file.name || (isVideo ? "video.mp4" : "arquivo.jpg");

  // 3. Solicita link S3
  const { upload_url, final_url } = await solicitarLinkS3(filename, mimeType);

  // 4. Faz upload
  const response = await fetch(file.uri);
  const blob = await response.blob();

  const uploadResult = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: blob,
  });

  if (!uploadResult.ok) {
    throw new Error(`Falha no upload. Status: ${uploadResult.status}`);
  }

  // 5. Retorna URL final
  return final_url;
}
