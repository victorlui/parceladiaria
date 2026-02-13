import { Alert } from "react-native";
import { solicitarLinkS3 } from "@/services/upload-files";
import { useAuthStore } from "@/store/auth";
import * as FileSystem from "expo-file-system/legacy";

type UploadFileParams = {
  file: {
    uri: string;
    name?: string;
    mimeType?: string;
  };
};

export async function uploadFileToS3({ file }: UploadFileParams) {
  const tokenRegister =
    useAuthStore.getState().tokenRegister ?? useAuthStore.getState().token;
  console.log("tokenRegister", useAuthStore.getState().tokenRegister);
  console.log("token", useAuthStore.getState().token);
  try {
    const mimeType = file.mimeType || "image/jpeg";
    const isVideo = mimeType.startsWith("video/");
    const extFromMime = mimeType.split("/")[1] || (isVideo ? "mp4" : "jpg");
    const filename =
      file.name ||
      (isVideo ? `video.${extFromMime}` : `arquivo.${extFromMime}`);

    let fileUri = file.uri;
    if (typeof fileUri === "string" && fileUri.startsWith("data:")) {
      const base64 = fileUri.split(",")[1] || "";
      const tempPath = `${FileSystem.cacheDirectory}upload_${Date.now()}.${extFromMime}`;
      await FileSystem.writeAsStringAsync(tempPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileUri = tempPath;
    }

    const response = await fetch(fileUri);
    const blob = await response.blob();

    const fileSize = blob.size;
    if (!isVideo && fileSize > 10 * 1024 * 1024) {
      Alert.alert("Arquivo muito grande (máx. 10MB)");
      return null;
    }

    console.log("fileSize", tokenRegister);

    const { upload_url, final_url } = await solicitarLinkS3(
      filename,
      mimeType,
      tokenRegister,
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
  } catch (error: any) {
    console.log("error", error);
    Alert.alert("Erro no upload", "Não foi possível enviar o arquivo.");
    return null;
  }
}

export async function uploadRawFile(file: any) {
  return uploadFileToS3({
    file: {
      uri: file.uri || file.path,
      name: file.name,
      mimeType: file.mimeType || file.type,
    },
  });
}
