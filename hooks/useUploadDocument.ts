import { solicitarLinkS3 } from "@/services/upload-files";
import { useAuthStore } from "@/store/auth";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";

type UploadFileParams = {
  file: {
    uri: string;
    name?: string;
    mimeType?: string;
  };
};

type UploadFileByUrlParams = UploadFileParams & {
  uploadUrl: string;
};

export async function uploadFileToS3({ file }: UploadFileParams) {
  const tokenRegister =
    useAuthStore.getState().tokenRegister ?? useAuthStore.getState().token;

  try {
    const mimeType = file.mimeType || "image/jpeg";
    const isVideo = mimeType.startsWith("video/");
    const extFromMime = mimeType.split("/")[1] || (isVideo ? "mp4" : "jpg");
    const filename =
      file.name ||
      (isVideo ? `video.${extFromMime}` : `arquivo.${extFromMime}`);

    let fileUri = file.uri;

    // 1. Tratamento de Base64 (Mantido como você fez)
    if (typeof fileUri === "string" && fileUri.startsWith("data:")) {
      const base64 = fileUri.split(",")[1] || "";
      const tempPath = `${FileSystem.cacheDirectory}upload_${Date.now()}.${extFromMime}`;
      await FileSystem.writeAsStringAsync(tempPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileUri = tempPath;
    }

    // 2. 🔥 NOVA ABORDAGEM: Validar tamanho sem carregar o BLOB na memória
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("Arquivo não encontrado no dispositivo.");
    }

    const fileSize = fileInfo.size; // Tamanho em bytes
    if (!isVideo && fileSize > 10 * 1024 * 1024) {
      Alert.alert("Erro", "Arquivo muito grande (máx. 10MB)");
      return null;
    }

    // 3. Solicita a URL assinada do S3
    const { upload_url, final_url } = await solicitarLinkS3(
      filename,
      mimeType,
      tokenRegister,
    );

    // 4. 🔥 O PULO DO GATO: Upload direto do disco usando HTTP PUT
    // Isso evita o uso de memória RAM e não gera "Network Error"
    const uploadResult = await FileSystem.uploadAsync(upload_url, fileUri, {
      httpMethod: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT, // Crucial para o PUT do S3 funcionar
    });

    // O FileSystem retorna o status dentro do objeto de resposta
    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Falha no upload do S3. Status: ${uploadResult.status}`);
    }

    return final_url;
  } catch (error: any) {
    console.error("Erro detalhado no upload:", error);
    if (error?.response?.status !== 401) {
      Alert.alert("Erro no upload", "Não foi possível enviar o arquivo.");
    }
    throw error;
  }
}

export async function uploadFileToSignedUrl({
  file,
  uploadUrl,
}: UploadFileByUrlParams) {
  try {
    const mimeType = file.mimeType || "image/jpeg";
    const isVideo = mimeType.startsWith("video/");
    const extFromMime = mimeType.split("/")[1] || (isVideo ? "mp4" : "jpg");

    let fileUri = file.uri;

    if (typeof fileUri === "string" && fileUri.startsWith("data:")) {
      const base64 = fileUri.split(",")[1] || "";
      const tempPath = `${FileSystem.cacheDirectory}upload_${Date.now()}.${extFromMime}`;
      await FileSystem.writeAsStringAsync(tempPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileUri = tempPath;
    }

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("Arquivo não encontrado no dispositivo.");
    }

    const fileSize = fileInfo.size;
    if (!isVideo && fileSize > 10 * 1024 * 1024) {
      Alert.alert("Erro", "Arquivo muito grande (máx. 10MB)");
      return null;
    }

    const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Falha no upload do S3. Status: ${uploadResult.status}`);
    }

    return uploadUrl.split("?")[0];
  } catch (error: any) {
    console.error("Erro detalhado no upload por URL assinada:", error);
    Alert.alert("Erro no upload", "Não foi possível enviar o arquivo.");
    throw error;
  }
}

export async function UploadFileService({ file }: UploadFileParams) {
  const tokenRegister =
    useAuthStore.getState().tokenRegister ?? useAuthStore.getState().token;

  try {
    const mimeType = file.mimeType || "image/jpeg";
    const isVideo = mimeType.startsWith("video/");
    const extFromMime = mimeType.split("/")[1] || (isVideo ? "mp4" : "jpg");
    const filename =
      file.name ||
      (isVideo ? `video.${extFromMime}` : `arquivo.${extFromMime}`);

    let fileUri = file.uri;

    // 1. Tratamento de Base64 (Mantido como você fez)
    if (typeof fileUri === "string" && fileUri.startsWith("data:")) {
      const base64 = fileUri.split(",")[1] || "";
      const tempPath = `${FileSystem.cacheDirectory}upload_${Date.now()}.${extFromMime}`;
      await FileSystem.writeAsStringAsync(tempPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      fileUri = tempPath;
    }

    // 2. 🔥 NOVA ABORDAGEM: Validar tamanho sem carregar o BLOB na memória
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("Arquivo não encontrado no dispositivo.");
    }

    const fileSize = fileInfo.size; // Tamanho em bytes
    if (!isVideo && fileSize > 10 * 1024 * 1024) {
      Alert.alert("Erro", "Arquivo muito grande (máx. 10MB)");
      return null;
    }

    // 3. Solicita a URL assinada do S3
    const { upload_url, final_url } = await solicitarLinkS3(
      filename,
      mimeType,
      tokenRegister,
    );

    // 4. 🔥 O PULO DO GATO: Upload direto do disco usando HTTP PUT
    // Isso evita o uso de memória RAM e não gera "Network Error"
    const uploadResult = await FileSystem.uploadAsync(upload_url, fileUri, {
      httpMethod: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT, // Crucial para o PUT do S3 funcionar
    });

    // O FileSystem retorna o status dentro do objeto de resposta
    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Falha no upload do S3. Status: ${uploadResult.status}`);
    }

    return final_url;
  } catch (error: any) {
    console.error("Erro detalhado no upload:", error);
    if (error?.response?.status !== 401) {
      Alert.alert("Erro no upload", "Não foi possível enviar o arquivo.");
    }
    throw error;
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

export async function uploadRawFileToSignedUrl(file: any, uploadUrl: string) {
  return uploadFileToSignedUrl({
    uploadUrl,
    file: {
      uri: file.uri || file.path,
      name: file.name,
      mimeType: file.mimeType || file.type,
    },
  });
}
