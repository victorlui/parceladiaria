import { trackAppError } from "@/analytics/error-handler";
import {
  EXTENSION_BY_MIME,
  MAX_FILE_SIZE_MB,
  MIME_BY_EXTENSION,
} from "@/constants/upload";
import * as Device from "expo-device";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

export type SafeImageSource = "camera" | "library";

export type SafePickImageOptions = {
  source?: SafeImageSource;
  customName?: string;
  maxFileSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  compress?: number;
};

export type SafeImageResult = {
  uri: string;
  originalUri: string;
  name: string;
  mimeType: "image/jpeg";
  type: "image";
  width?: number;
  height?: number;
  size: number | null;
};

type FileInfoLike = {
  exists: boolean;
  size: number | null;
};

const SAFE_IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}safe-images/`;
const SECONDARY_SAFE_IMAGE_CACHE_DIR = `${SAFE_IMAGE_CACHE_DIR}processed/`;
const DEFAULT_MAX_IMAGE_DIMENSION = 2048;
const DEFAULT_COMPRESS = 0.8;

function getDeviceContext() {
  return {
    platform: Platform.OS,
    platformVersion: String(Platform.Version),
    osVersion: Device.osVersion ?? null,
    osBuildId: Device.osBuildId ?? null,
    modelName: Device.modelName ?? null,
    brand: Device.brand ?? null,
    manufacturer: Device.manufacturer ?? null,
  };
}

function logImageEvent(stage: string, payload: Record<string, unknown> = {}) {
  console.log("[safe-image]", stage, {
    ...payload,
    ...getDeviceContext(),
    timestamp: new Date().toISOString(),
  });
}

function logImageError(
  stage: string,
  error: unknown,
  payload: Record<string, unknown> = {},
) {
  const normalized =
    error instanceof Error
      ? error
      : new Error(String(error ?? "Erro desconhecido"));

  logImageEvent(`${stage}_error`, {
    ...payload,
    message: normalized.message,
    stack: normalized.stack,
  });

  trackAppError(normalized, {
    source: "safe-image",
    stage,
    ...payload,
    ...getDeviceContext(),
  });
}

function sanitizeFileName(name: string, fallbackExt: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!cleaned) {
    return `image_${Date.now()}.${fallbackExt}`;
  }

  if (cleaned.includes(".")) {
    return cleaned;
  }

  return `${cleaned}.${fallbackExt}`;
}

function inferExtension(uri?: string | null, mimeType?: string | null): string {
  const fromMime = mimeType
    ? (EXTENSION_BY_MIME[mimeType.toLowerCase()] ?? mimeType.split("/")[1])
    : null;

  if (fromMime) return fromMime;

  const extFromUri = uri
    ?.split("?")[0]
    .split("#")[0]
    .split("/")
    .pop()
    ?.split(".")
    .pop()
    ?.toLowerCase();

  return extFromUri || "jpg";
}

async function ensureDirectoryExists(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}

async function safeGetInfo(uri: string): Promise<FileInfoLike> {
  try {
    const info = (await FileSystem.getInfoAsync(uri)) as {
      exists: boolean;
      size?: number | null;
    };
    return {
      exists: info.exists,
      size: typeof info.size === "number" ? info.size : null,
    };
  } catch (error) {
    logImageError("get_info", error, { uri });
    return { exists: false, size: null };
  }
}

async function copyUriToCache(uri: string, fileName: string): Promise<string> {
  await ensureDirectoryExists(SAFE_IMAGE_CACHE_DIR);
  const destination = `${SAFE_IMAGE_CACHE_DIR}${Date.now()}_${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

function buildResizeAction(
  width?: number,
  height?: number,
  maxDimension?: number,
) {
  if (!width || !height || !maxDimension) {
    return null;
  }

  const largestSide = Math.max(width, height);
  if (largestSide <= maxDimension) {
    return null;
  }

  if (width >= height) {
    return {
      resize: {
        width: maxDimension,
        height: Math.max(1, Math.round((height / width) * maxDimension)),
      },
    };
  }

  return {
    resize: {
      width: Math.max(1, Math.round((width / height) * maxDimension)),
      height: maxDimension,
    },
  };
}

async function processImageToJpeg(
  sourceUri: string,
  width?: number,
  height?: number,
  compress: number = DEFAULT_COMPRESS,
  maxDimension: number = DEFAULT_MAX_IMAGE_DIMENSION,
) {
  await ensureDirectoryExists(SECONDARY_SAFE_IMAGE_CACHE_DIR);

  const resizeAction = buildResizeAction(width, height, maxDimension);
  const actions = resizeAction ? [resizeAction] : [];

  return ImageManipulator.manipulateAsync(sourceUri, actions, {
    compress,
    format: ImageManipulator.SaveFormat.JPEG,
  });
}

async function materializeImageAsset(
  asset: ImagePicker.ImagePickerAsset,
  options: SafePickImageOptions,
): Promise<SafeImageResult> {
  const originalUri = asset.uri;
  const originalName =
    asset.fileName ??
    `image_${Date.now()}.${inferExtension(asset.uri, asset.mimeType ?? null)}`;
  const originalMime =
    (asset.mimeType?.toLowerCase() as string | undefined) ??
    MIME_BY_EXTENSION[inferExtension(asset.uri, null)] ??
    "image/jpeg";

  logImageEvent("selection", {
    originalUri,
    fileName: originalName,
    mimeType: originalMime,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize ?? null,
  });

  const initialInfo = await safeGetInfo(originalUri);
  if (!initialInfo.exists && !originalUri.startsWith("content://")) {
    throw new Error("A imagem selecionada nao existe mais no dispositivo.");
  }

  const cacheFileName = sanitizeFileName(
    originalName,
    inferExtension(asset.uri, asset.mimeType ?? null),
  );
  const cachedOriginalUri = await copyUriToCache(originalUri, cacheFileName);

  const copiedInfo = await safeGetInfo(cachedOriginalUri);
  if (!copiedInfo.exists) {
    throw new Error("Nao foi possivel copiar a imagem para o cache seguro.");
  }

  logImageEvent("post_copy", {
    originalUri,
    cacheUri: cachedOriginalUri,
    exists: copiedInfo.exists,
    copiedSize: copiedInfo.size,
  });

  const maxFileSizeBytes =
    (options.maxFileSizeMB ?? MAX_FILE_SIZE_MB) * 1024 * 1024;
  const firstPass = await processImageToJpeg(
    cachedOriginalUri,
    asset.width,
    asset.height,
    options.compress ?? DEFAULT_COMPRESS,
    Math.max(
      options.maxWidth ?? 0,
      options.maxHeight ?? 0,
      DEFAULT_MAX_IMAGE_DIMENSION,
    ),
  );

  let processedInfo = await safeGetInfo(firstPass.uri);
  let finalImage = firstPass;

  if (processedInfo.size && processedInfo.size > maxFileSizeBytes) {
    const secondPass = await processImageToJpeg(
      firstPass.uri,
      firstPass.width,
      firstPass.height,
      0.65,
      1600,
    );
    processedInfo = await safeGetInfo(secondPass.uri);
    finalImage = secondPass;
  }

  if (!processedInfo.exists) {
    throw new Error("Nao foi possivel preparar a imagem para upload.");
  }

  if (processedInfo.size && processedInfo.size > maxFileSizeBytes) {
    throw new Error(
      `A imagem excede o limite de ${options.maxFileSizeMB ?? MAX_FILE_SIZE_MB}MB mesmo apos a compressao.`,
    );
  }

  try {
    await FileSystem.deleteAsync(cachedOriginalUri, { idempotent: true });
  } catch (error) {
    logImageError("cleanup_cached_original", error, {
      uri: cachedOriginalUri,
    });
  }

  const finalName = sanitizeFileName(
    options.customName || originalName,
    "jpg",
  ).replace(/\.[a-zA-Z0-9]+$/, ".jpg");

  logImageEvent("ready", {
    originalUri,
    safeUri: finalImage.uri,
    fileName: finalName,
    mimeType: "image/jpeg",
    width: finalImage.width,
    height: finalImage.height,
    size: processedInfo.size,
  });

  return {
    uri: finalImage.uri,
    originalUri,
    name: finalName,
    mimeType: "image/jpeg",
    type: "image",
    width: finalImage.width,
    height: finalImage.height,
    size: processedInfo.size,
  };
}

async function requestPermission(source: SafeImageSource): Promise<boolean> {
  try {
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      return permission.status === "granted";
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permission.status === "granted";
  } catch (error) {
    logImageError("request_permission", error, { source });
    return false;
  }
}

export async function safePickImage(
  options: SafePickImageOptions = {},
): Promise<SafeImageResult | null> {
  const source = options.source ?? "camera";

  try {
    const hasPermission = await requestPermission(source);
    if (!hasPermission) {
      Alert.alert(
        "Permissao necessaria",
        source === "camera"
          ? "Permita o acesso a camera para capturar a imagem."
          : "Permita o acesso as fotos para selecionar a imagem.",
      );
      return null;
    }

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      allowsEditing: false,
      quality: 1,
      exif: false,
      mediaTypes: "images" as any,
      selectionLimit: 1,
    };

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            ...pickerOptions,
            cameraType: ImagePicker.CameraType.back,
          })
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (result.canceled) {
      logImageEvent("cancelled", { source });
      return null;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      throw new Error("A selecao de imagem retornou sem URI valida.");
    }

    return await materializeImageAsset(asset, options);
  } catch (error) {
    logImageError("pick_image", error, { source });
    Alert.alert(
      "Erro",
      "Nao foi possivel selecionar a imagem. Tente novamente.",
    );
    return null;
  }
}

export function useImagePicker(
  defaultOptions: Omit<SafePickImageOptions, "source"> = {},
) {
  const pickFromCamera = (options: Omit<SafePickImageOptions, "source"> = {}) =>
    safePickImage({
      ...defaultOptions,
      ...options,
      source: "camera",
    });

  const pickFromLibrary = (
    options: Omit<SafePickImageOptions, "source"> = {},
  ) =>
    safePickImage({
      ...defaultOptions,
      ...options,
      source: "library",
    });

  return {
    pickFromCamera,
    pickFromLibrary,
    safePickImage,
  };
}
