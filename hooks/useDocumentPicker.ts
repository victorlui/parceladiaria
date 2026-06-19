import {
  EXTENSION_BY_MIME,
  MAX_FILE_SIZE_MB,
  MIME_BY_EXTENSION,
  SUPPORTED_EXTENSIONS,
  type AllowedMimeType,
} from "@/constants/upload";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SelectedFileType = "pdf" | "image" | "video";

export type SelectedFile = {
  uri: string;
  name: string;
  mimeType: string;
  type: SelectedFileType;
};

export type PickerOptions = {
  /** Origem do arquivo (câmera ou galeria) */
  from?: "camera" | "library";
  /** Nome customizado para o arquivo */
  customName?: string;
  /** Largura máxima desejada (apenas imagens) */
  maxWidth?: number;
  /** Altura máxima desejada (apenas imagens) */
  maxHeight?: number;
};

type SizeCheck = { valid: boolean; size: number | null };

/* -------------------------------------------------------------------------- */
/*                                  CONSTS                                   */
/* -------------------------------------------------------------------------- */

/** Duração máxima padrão para gravação de vídeo (em segundos) */
const MAX_VIDEO_DURATION_SEC = 60;

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function log(stage: string, payload: Record<string, unknown> = {}) {
  if (__DEV__) {
    console.log(`[picker] ${stage}`, payload);
  }
}

function sanitizeFileName(name: string, fallbackExt: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.length > 0 ? cleaned : `file_${Date.now()}.${fallbackExt}`;
}

function inferMimeFromUri(uri: string): string | null {
  const ext = uri
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .pop()
    ?.split(".")
    .pop()
    ?.toLowerCase();
  if (!ext) return null;
  return MIME_BY_EXTENSION[ext] ?? null;
}

function normalizeMime(input?: string | null): AllowedMimeType | null {
  if (!input) return null;
  const lower = input.trim().toLowerCase();
  return (lower as AllowedMimeType) ?? null;
}

async function getFileSize(uri: string): Promise<number | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    return typeof info.size === "number" ? info.size : null;
  } catch (err) {
    log("getFileSize_failed", { uri, error: String(err) });
    return null;
  }
}

async function copyToCacheIfNeeded(
  uri: string,
  fileName: string,
): Promise<string> {
  const cacheDir =
    (FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory;
  if (!cacheDir || uri.startsWith(cacheDir)) return uri;
  try {
    const dest = `${cacheDir}picker_${Date.now()}_${fileName}`;
    await (FileSystem as any).copyAsync({ from: uri, to: dest });
    return dest;
  } catch (err) {
    log("copyToCache_failed", { uri, error: String(err) });
    return uri;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* -------------------------------------------------------------------------- */
/*                                  HOOK                                      */
/* -------------------------------------------------------------------------- */

export function useDocumentPicker(maxSizeMB: number = MAX_FILE_SIZE_MB) {
  const maxVideoSizeMB = Math.max(maxSizeMB * 5, 50);

  const ensureSizeLimit = async (
    uri: string,
    maxMb: number,
  ): Promise<SizeCheck> => {
    const size = await getFileSize(uri);
    if (size === null) {
      // Sem informação de tamanho: aceitamos e validamos depois no upload
      return { valid: true, size: null };
    }
    const limitBytes = maxMb * 1024 * 1024;
    return { valid: size <= limitBytes, size };
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permissões necessárias",
          "Para usar esta funcionalidade, é necessário permitir o acesso à câmera e galeria.",
        );
        return false;
      }
      return true;
    } catch (error) {
      log("requestPermissions_failed", { error: String(error) });
      return false;
    }
  };

  const selectPDF = async (
    customName?: string,
  ): Promise<SelectedFile | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled || result.assets.length === 0) return null;

      const file = result.assets[0];
      const extFromName = file.name?.toLowerCase().split(".").pop();
      const extension =
        extFromName && SUPPORTED_EXTENSIONS.has(extFromName)
          ? extFromName
          : "pdf";
      const mimeType =
        normalizeMime(file.mimeType) ??
        (MIME_BY_EXTENSION[extension] as AllowedMimeType) ??
        "application/pdf";

      const stableUri = await copyToCacheIfNeeded(file.uri, file.name);
      const sizeCheck = await ensureSizeLimit(stableUri, maxSizeMB);

      if (!sizeCheck.valid) {
        Alert.alert(
          "Arquivo muito grande",
          `O arquivo PDF deve ter no máximo ${maxSizeMB}MB. Por favor, selecione um arquivo menor.`,
        );
        return null;
      }

      log("pdf_selected", {
        uri: stableUri,
        name: file.name,
        mimeType,
        size: sizeCheck.size,
      });

      return {
        uri: stableUri,
        name: customName ? sanitizeFileName(customName, "pdf") : file.name,
        mimeType,
        type: "pdf",
      };
    } catch (error) {
      log("selectPDF_failed", { error: String(error) });
      Alert.alert("Erro", "Não foi possível selecionar o arquivo PDF.");
      return null;
    }
  };

  const pickImage = async (
    options: PickerOptions,
  ): Promise<ImagePicker.ImagePickerResult> => {
    const from = options.from ?? "camera";
    const baseConfig: ImagePicker.ImagePickerOptions = {
      quality: 0.7,
      allowsEditing: true,
      mediaTypes: "images",
      exif: false,
    };

    if (from === "camera") {
      return await ImagePicker.launchCameraAsync({
        ...baseConfig,
        cameraType: ImagePicker.CameraType.back,
      });
    }
    return await ImagePicker.launchImageLibraryAsync(baseConfig);
  };

  const takePhoto = async (
    fromOrOptions: "camera" | "library" | PickerOptions = "camera",
    customName?: string,
  ): Promise<SelectedFile | null> => {
    const options: PickerOptions =
      typeof fromOrOptions === "string"
        ? { from: fromOrOptions }
        : fromOrOptions;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const result = await pickImage(options);
      return await processImageResult(result, options, customName);
    } catch (error) {
      log("takePhoto_failed", { error: String(error) });
      Alert.alert("Erro", "Não foi possível capturar a foto.");
      return null;
    }
  };

  const processImageResult = async (
    result: ImagePicker.ImagePickerResult,
    options: PickerOptions,
    customName?: string,
  ): Promise<SelectedFile | null> => {
    if (result.canceled || result.assets.length === 0) return null;

    const asset = result.assets[0];
    const inferredMime = inferMimeFromUri(asset.uri) ?? "image/jpeg";

    const sizeCheck = await ensureSizeLimit(asset.uri, maxSizeMB);
    if (!sizeCheck.valid) {
      Alert.alert(
        "Imagem muito grande",
        `A imagem deve ter no máximo ${maxSizeMB}MB. Selecione uma imagem menor.`,
      );
      return null;
    }

    log("photo_selected", {
      uri: asset.uri,
      inferredMime,
      size: sizeCheck.size,
    });

    return {
      uri: asset.uri,
      name: customName
        ? sanitizeFileName(customName, "jpg")
        : `photo_${Date.now()}.jpg`,
      mimeType: inferredMime,
      type: "image",
    };
  };

  const takeVideo = async (
    fromOrOptions: "camera" | "library" | PickerOptions = "camera",
    customName?: string,
  ): Promise<SelectedFile | null> => {
    const options: PickerOptions =
      typeof fromOrOptions === "string"
        ? { from: fromOrOptions }
        : fromOrOptions;
    const from = options.from ?? "camera";

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      // Configurações otimizadas para reduzir tamanho do vídeo
      const videoOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: "videos",
        videoMaxDuration: MAX_VIDEO_DURATION_SEC,
        allowsEditing: false,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
      };

      const result =
        from === "camera"
          ? await ImagePicker.launchCameraAsync(videoOptions)
          : await ImagePicker.launchImageLibraryAsync(videoOptions);

      if (result.canceled || result.assets.length === 0) return null;

      const asset = result.assets[0];
      const inferredMime = inferMimeFromUri(asset.uri) ?? "video/mp4";

      const sizeCheck = await ensureSizeLimit(asset.uri, maxVideoSizeMB);
      if (!sizeCheck.valid) {
        Alert.alert(
          "Vídeo muito grande",
          `O vídeo deve ter no máximo ${formatBytes(maxVideoSizeMB * 1024 * 1024)}. Por favor, grave um vídeo menor ou reduza a qualidade.`,
        );
        return null;
      }

      log("video_selected", {
        uri: asset.uri,
        inferredMime,
        size: sizeCheck.size,
        platform: Platform.OS,
      });

      return {
        uri: asset.uri,
        name: customName
          ? sanitizeFileName(customName, "mp4")
          : `video_${Date.now()}.mp4`,
        mimeType: inferredMime,
        type: "video",
      };
    } catch (error) {
      log("takeVideo_failed", { error: String(error) });
      Alert.alert("Erro", "Não foi possível capturar o vídeo.");
      return null;
    }
  };

  return { selectPDF, takePhoto, takeVideo };
}

// Helper: type guard para detectar SelectedFile
export function isAllowedExtension(ext: string): boolean {
  return SUPPORTED_EXTENSIONS.has(ext.toLowerCase());
}

// Helper: dado mime retorna o extension esperado
export function getExtensionForMime(mime: string): string | null {
  return EXTENSION_BY_MIME[mime.toLowerCase()] ?? null;
}
