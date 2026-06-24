import {
  EXTENSION_BY_MIME,
  MAX_FILE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  MIME_BY_EXTENSION,
  SUPPORTED_EXTENSIONS,
} from "@/constants/upload";
import { safePickImage, type SafeImageSource } from "@/hooks/useImagePicker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

export type SelectedFileType = "pdf" | "image" | "video";

export type SelectedFile = {
  uri: string;
  name: string;
  mimeType: string;
  type: SelectedFileType;
};

export type PickerOptions = {
  from?: SafeImageSource;
  customName?: string;
  maxWidth?: number;
  maxHeight?: number;
};

type SizeCheck = { valid: boolean; size: number | null };

const MAX_VIDEO_DURATION_SEC = 60;
const MAX_VIDEO_DURATION_TOLERANCE_MS = 999;
const SAFE_PICKER_CACHE_DIR = `${FileSystem.cacheDirectory}safe-picker/`;

function log(stage: string, payload: Record<string, unknown> = {}) {
  console.log("[document-picker]", stage, {
    ...payload,
    platform: Platform.OS,
    platformVersion: String(Platform.Version),
    timestamp: new Date().toISOString(),
  });
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

async function ensureDirectoryExists(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}

async function getFileSize(uri: string): Promise<number | null> {
  try {
    const info = (await FileSystem.getInfoAsync(uri)) as {
      exists: boolean;
      size?: number | null;
    };
    if (!info.exists) return null;
    return typeof info.size === "number" ? info.size : null;
  } catch (err) {
    log("get_file_size_failed", { uri, error: String(err) });
    return null;
  }
}

async function copyToCacheOrThrow(
  uri: string,
  fileName: string,
): Promise<string> {
  await ensureDirectoryExists(SAFE_PICKER_CACHE_DIR);
  const destination = `${SAFE_PICKER_CACHE_DIR}${Date.now()}_${sanitizeFileName(fileName, "bin")}`;
  await FileSystem.copyAsync({ from: uri, to: destination });

  const copiedInfo = (await FileSystem.getInfoAsync(destination)) as {
    exists: boolean;
    size?: number | null;
  };

  if (!copiedInfo.exists) {
    throw new Error("Nao foi possivel estabilizar o arquivo em cache.");
  }

  log("cache_copy", {
    originalUri: uri,
    safeUri: destination,
    size: typeof copiedInfo.size === "number" ? copiedInfo.size : null,
  });

  return destination;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getVideoDurationSec(
  asset: ImagePicker.ImagePickerAsset,
): number | null {
  if (typeof asset.duration !== "number" || Number.isNaN(asset.duration)) {
    return null;
  }

  return asset.duration / 1000;
}

function isVideoDurationAllowed(asset: ImagePicker.ImagePickerAsset): boolean {
  if (typeof asset.duration !== "number" || Number.isNaN(asset.duration)) {
    return true;
  }

  // Some providers round UI display to 1:00 while metadata comes slightly above 60000ms.
  return (
    asset.duration <=
    MAX_VIDEO_DURATION_SEC * 1000 + MAX_VIDEO_DURATION_TOLERANCE_MS
  );
}

export function useDocumentPicker(maxSizeMB: number = MAX_FILE_SIZE_MB) {
  const maxVideoSizeMB = Math.max(maxSizeMB, MAX_VIDEO_SIZE_MB);

  const ensureSizeLimit = async (
    uri: string,
    maxMb: number,
  ): Promise<SizeCheck> => {
    const size = await getFileSize(uri);
    if (size === null) {
      return { valid: true, size: null };
    }
    const limitBytes = maxMb * 1024 * 1024;
    return { valid: size <= limitBytes, size };
  };

  const requestVideoPermission = async (
    from: SafeImageSource,
  ): Promise<boolean> => {
    try {
      if (from === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status === "granted") return true;
        Alert.alert(
          "Permissao necessaria",
          "Permita o acesso a camera para capturar o video.",
        );
        return false;
      }

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === "granted") return true;
      Alert.alert(
        "Permissao necessaria",
        "Permita o acesso a galeria para selecionar o video.",
      );
      return false;
    } catch (error) {
      log("request_video_permission_failed", {
        from,
        error: String(error),
      });
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

      if (result.canceled || !result.assets?.length) {
        log("pdf_cancelled");
        return null;
      }

      const file = result.assets[0];
      if (!file?.uri) {
        throw new Error("O PDF selecionado nao possui URI valida.");
      }

      const extFromName = file.name?.toLowerCase().split(".").pop();
      const extension =
        extFromName && SUPPORTED_EXTENSIONS.has(extFromName)
          ? extFromName
          : "pdf";
      const mimeType = file.mimeType?.toLowerCase() || "application/pdf";
      const stableUri = await copyToCacheOrThrow(
        file.uri,
        file.name || `document_${Date.now()}.${extension}`,
      );
      const sizeCheck = await ensureSizeLimit(stableUri, maxSizeMB);

      if (!sizeCheck.valid) {
        Alert.alert(
          "Arquivo muito grande",
          `O arquivo PDF deve ter no maximo ${maxSizeMB}MB. Por favor, selecione um arquivo menor.`,
        );
        return null;
      }

      log("pdf_selected", {
        originalUri: file.uri,
        safeUri: stableUri,
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
      log("select_pdf_failed", { error: String(error) });
      Alert.alert("Erro", "Nao foi possivel selecionar o arquivo PDF.");
      return null;
    }
  };

  const takePhoto = async (
    fromOrOptions: SafeImageSource | PickerOptions = "camera",
    customName?: string,
  ): Promise<SelectedFile | null> => {
    const options: PickerOptions =
      typeof fromOrOptions === "string"
        ? { from: fromOrOptions, customName }
        : {
            ...fromOrOptions,
            customName: fromOrOptions.customName ?? customName,
          };

    try {
      const image = await safePickImage({
        source: options.from ?? "camera",
        customName: options.customName,
        maxFileSizeMB: maxSizeMB,
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
      });

      if (!image) {
        return null;
      }

      return {
        uri: image.uri,
        name: image.name,
        mimeType: image.mimeType,
        type: "image",
      };
    } catch (error) {
      log("take_photo_failed", { error: String(error) });
      Alert.alert("Erro", "Nao foi possivel selecionar a imagem.");
      return null;
    }
  };

  const takeVideo = async (
    fromOrOptions: SafeImageSource | PickerOptions = "camera",
    customName?: string,
  ): Promise<SelectedFile | null> => {
    const options: PickerOptions =
      typeof fromOrOptions === "string"
        ? { from: fromOrOptions, customName }
        : {
            ...fromOrOptions,
            customName: fromOrOptions.customName ?? customName,
          };
    const from = options.from ?? "camera";

    try {
      const hasPermission = await requestVideoPermission(from);
      if (!hasPermission) return null;

      const videoOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: "videos" as any,
        videoMaxDuration: MAX_VIDEO_DURATION_SEC,
        allowsEditing: false,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low,
      };

      const result =
        from === "camera"
          ? await ImagePicker.launchCameraAsync(videoOptions)
          : await ImagePicker.launchImageLibraryAsync(videoOptions);

      if (result.canceled || !result.assets?.length) {
        log("video_cancelled", { from });
        return null;
      }

      const asset = result.assets[0];
      if (!asset?.uri) {
        throw new Error("O video selecionado nao possui URI valida.");
      }

      const durationSec = getVideoDurationSec(asset);
      if (!isVideoDurationAllowed(asset)) {
        Alert.alert(
          "Video muito longo",
          `O video deve ter no maximo ${MAX_VIDEO_DURATION_SEC} segundos.`,
        );
        return null;
      }

      const inferredMime = inferMimeFromUri(asset.uri) ?? "video/mp4";
      const fileName =
        options.customName ||
        asset.fileName ||
        `video_${Date.now()}.${EXTENSION_BY_MIME[inferredMime] ?? "mp4"}`;
      const stableUri = await copyToCacheOrThrow(asset.uri, fileName);

      const sizeCheck = await ensureSizeLimit(stableUri, maxVideoSizeMB);
      if (!sizeCheck.valid) {
        Alert.alert(
          "Video muito grande",
          `O video deve ter no maximo ${formatBytes(maxVideoSizeMB * 1024 * 1024)}. Por favor, grave um video menor ou reduza a qualidade.`,
        );
        return null;
      }

      log("video_selected", {
        originalUri: asset.uri,
        safeUri: stableUri,
        mimeType: inferredMime,
        durationSec,
        size: sizeCheck.size,
      });

      return {
        uri: stableUri,
        name: sanitizeFileName(
          fileName,
          EXTENSION_BY_MIME[inferredMime] ?? "mp4",
        ),
        mimeType: inferredMime,
        type: "video",
      };
    } catch (error) {
      log("take_video_failed", { error: String(error), from });
      Alert.alert("Erro", "Nao foi possivel capturar o video.");
      return null;
    }
  };

  return { selectPDF, takePhoto, takeVideo };
}

export function isAllowedExtension(ext: string): boolean {
  return SUPPORTED_EXTENSIONS.has(ext.toLowerCase());
}

export function getExtensionForMime(mime: string): string | null {
  return EXTENSION_BY_MIME[mime.toLowerCase()] ?? null;
}
