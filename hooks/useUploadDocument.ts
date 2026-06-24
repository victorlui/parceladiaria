import { trackAppError } from "@/analytics/error-handler";
import {
  MAX_FILE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  MIME_BY_EXTENSION,
} from "@/constants/upload";
import { solicitarLinkS3 } from "@/services/upload-files";
import * as Device from "expo-device";
import * as FileSystem from "expo-file-system/legacy";
import * as Network from "expo-network";
import { Alert, Platform } from "react-native";

export type UploadCancelSignal = {
  cancelled: boolean;
};

type UploadFileLike =
  | string
  | {
      uri: string;
      name?: string;
      mimeType?: string;
      type?: string;
    };

type UploadOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  signal?: UploadCancelSignal;
  onProgress?: (fraction: number) => void;
};

type UploadFileParams = {
  file: UploadFileLike;
  options?: UploadOptions;
};

type NormalizedUploadFile = {
  uri: string;
  originalUri: string;
  name: string;
  mimeType: string;
  size: number | null;
  cleanup: () => Promise<void>;
};

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 2;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const STABLE_UPLOAD_CACHE_DIR = `${FileSystem.cacheDirectory}stable-uploads/`;
const DATA_URI_RE = /^data:([^;,]+);base64,(.*)$/;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function getUploadContext() {
  return {
    platform: Platform.OS,
    platformVersion: String(Platform.Version),
    osVersion: Device.osVersion ?? null,
    modelName: Device.modelName ?? null,
    brand: Device.brand ?? null,
  };
}

function logUpload(stage: string, payload: Record<string, unknown> = {}) {
  console.log("[safe-upload]", stage, {
    ...payload,
    ...getUploadContext(),
    timestamp: new Date().toISOString(),
  });
}

function logUploadError(
  stage: string,
  error: unknown,
  payload: Record<string, unknown> = {},
) {
  const normalized =
    error instanceof Error
      ? error
      : new Error(String(error ?? "Erro desconhecido"));

  logUpload(`${stage}_error`, {
    ...payload,
    message: normalized.message,
    stack: normalized.stack,
  });

  trackAppError(normalized, {
    source: "safe-upload",
    stage,
    ...payload,
    ...getUploadContext(),
  });
}

function isTransientError(err: any): boolean {
  if (!err) return false;
  const code = err?.code;
  const msg = String(err?.message || "").toLowerCase();
  if (
    code === "ECONNABORTED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ENETUNREACH" ||
    code === "EAI_AGAIN"
  ) {
    return true;
  }
  return (
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("tempo limite") ||
    msg.includes("aborted") ||
    msg.includes("failed to connect") ||
    msg.includes("socket") ||
    msg.includes("network request failed")
  );
}

function friendlyMessage(error: any): string {
  if (error?.response?.status === 401) return "";
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("cancelado")) return "";
  if (
    msg.includes("sem conexão") ||
    msg.includes("sem conexao") ||
    msg.includes("offline")
  ) {
    return "Voce esta offline. Verifique sua internet e tente novamente.";
  }
  if (msg.includes("tempo limite") || msg.includes("timeout")) {
    return "Conexao lenta ou instavel. Tente novamente em uma rede melhor.";
  }
  if (msg.includes("muito grande") || msg.includes("max_file_size")) {
    return "Arquivo muito grande. Selecione um arquivo menor.";
  }
  if (msg.includes("nao encontrado") || msg.includes("not found")) {
    return "Arquivo nao encontrado no dispositivo. Selecione outro e tente novamente.";
  }
  if (msg.includes("mime")) {
    return "O tipo do arquivo nao e suportado para envio.";
  }
  return "Nao foi possivel enviar o arquivo. Verifique sua conexao e tente novamente.";
}

function getMaxUploadSizeBytes(mimeType: string): number {
  return mimeType.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
}

function extFromMime(mime: string): string {
  const normalizedMime = mime.toLowerCase().split(";")[0].trim();
  return (
    {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/heic": "heic",
      "image/heif": "heif",
      "application/pdf": "pdf",
      "video/mp4": "mp4",
      "video/quicktime": "mov",
      "video/x-m4v": "m4v",
    }[normalizedMime] ||
    normalizedMime.split("/")[1] ||
    "bin"
  );
}

function sanitizeFileName(name: string, fallbackExt: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!cleaned) {
    return `upload_${Date.now()}.${fallbackExt}`;
  }

  if (cleaned.includes(".")) {
    return cleaned;
  }

  return `${cleaned}.${fallbackExt}`;
}

function inferMimeType(uri: string, candidate?: string): string {
  if (candidate) {
    return candidate.toLowerCase().split(";")[0].trim();
  }

  const ext = uri
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .pop()
    ?.split(".")
    .pop()
    ?.toLowerCase();

  return (ext && MIME_BY_EXTENSION[ext]) || "application/octet-stream";
}

async function ensureDirectoryExists(uri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}

async function getInfo(
  uri: string,
): Promise<{ exists: boolean; size: number | null }> {
  const info = (await FileSystem.getInfoAsync(uri)) as {
    exists: boolean;
    size?: number | null;
  };

  return {
    exists: info.exists,
    size: typeof info.size === "number" ? info.size : null,
  };
}

function normalizeInput(file: UploadFileLike): {
  uri: string;
  name?: string;
  mimeType?: string;
} {
  if (typeof file === "string") {
    return { uri: file };
  }

  return {
    uri: file.uri,
    name: file.name,
    mimeType: file.mimeType || file.type,
  };
}

async function materializeDataUri(
  uri: string,
  fallbackMimeType: string,
): Promise<NormalizedUploadFile> {
  const match = DATA_URI_RE.exec(uri);
  if (!match) {
    throw new Error(
      "Formato de arquivo nao suportado. Esperado data:image/...;base64,...",
    );
  }

  const mimeType = match[1] || fallbackMimeType || "application/octet-stream";
  const base64Data = match[2];

  if (!base64Data) {
    throw new Error("Conteudo do arquivo vazio.");
  }

  await ensureDirectoryExists(STABLE_UPLOAD_CACHE_DIR);
  const fileName = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extFromMime(mimeType)}`;
  const tempPath = `${STABLE_UPLOAD_CACHE_DIR}${fileName}`;

  await FileSystem.writeAsStringAsync(tempPath, base64Data, {
    encoding: "base64",
  });

  const info = await getInfo(tempPath);
  logUpload("materialized_data_uri", {
    originalUri: uri.slice(0, 40),
    safeUri: tempPath,
    mimeType,
    size: info.size,
  });

  return {
    uri: tempPath,
    originalUri: uri,
    name: fileName,
    mimeType,
    size: info.size,
    cleanup: async () => {
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
    },
  };
}

async function stabilizeLocalUri(
  normalized: ReturnType<typeof normalizeInput>,
): Promise<NormalizedUploadFile> {
  const originalUri = normalized.uri;
  if (!originalUri) {
    throw new Error("Arquivo invalido: URI vazia.");
  }

  const mimeType = inferMimeType(originalUri, normalized.mimeType);
  const fallbackExt = extFromMime(mimeType);
  const fileName = sanitizeFileName(
    normalized.name ||
      originalUri.split("?")[0].split("/").pop() ||
      `upload_${Date.now()}.${fallbackExt}`,
    fallbackExt,
  );

  if (originalUri.startsWith("http://") || originalUri.startsWith("https://")) {
    throw new Error(
      "Uploads devem usar arquivos locais estaveis, nao URLs remotas.",
    );
  }

  if (originalUri.startsWith("data:")) {
    return materializeDataUri(originalUri, mimeType);
  }

  await ensureDirectoryExists(STABLE_UPLOAD_CACHE_DIR);
  const stableUri = `${STABLE_UPLOAD_CACHE_DIR}${Date.now()}_${fileName}`;
  await FileSystem.copyAsync({ from: originalUri, to: stableUri });

  const info = await getInfo(stableUri);
  if (!info.exists) {
    throw new Error("Nao foi possivel copiar o arquivo para o cache seguro.");
  }

  logUpload("stabilized_file", {
    originalUri,
    safeUri: stableUri,
    fileName,
    mimeType,
    size: info.size,
  });

  return {
    uri: stableUri,
    originalUri,
    name: fileName,
    mimeType,
    size: info.size,
    cleanup: async () => {
      await FileSystem.deleteAsync(stableUri, { idempotent: true });
    },
  };
}

async function prepareUploadFile(
  file: UploadFileLike,
): Promise<NormalizedUploadFile> {
  const normalized = normalizeInput(file);
  const prepared = await stabilizeLocalUri(normalized);

  if (!prepared.mimeType || prepared.mimeType === "application/octet-stream") {
    throw new Error("Nao foi possivel determinar o MIME type do arquivo.");
  }

  if (!prepared.uri) {
    throw new Error("Nao foi possivel estabilizar a URI do arquivo.");
  }

  const info = await getInfo(prepared.uri);
  if (!info.exists) {
    throw new Error("Arquivo nao encontrado no dispositivo.");
  }

  if (info.size && info.size > getMaxUploadSizeBytes(prepared.mimeType)) {
    throw new Error("Arquivo muito grande");
  }

  logUpload("file_ready_for_upload", {
    originalUri: prepared.originalUri,
    safeUri: prepared.uri,
    fileName: prepared.name,
    mimeType: prepared.mimeType,
    size: info.size,
  });

  return {
    ...prepared,
    size: info.size,
  };
}

async function uploadWithProgress(
  url: string,
  fileUri: string,
  mimeType: string,
  timeoutMs: number,
  signal?: UploadCancelSignal,
  onProgress?: (fraction: number) => void,
): Promise<FileSystem.FileSystemUploadResult> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let cancellationWatcher: ReturnType<typeof setInterval> | null = null;
  let task: FileSystem.UploadTask | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      void task?.cancelAsync().catch(() => undefined);
      reject(
        new Error(
          `Upload excedeu o tempo limite de ${Math.round(timeoutMs / 1000)}s`,
        ),
      );
    }, timeoutMs);
  });

  const cancelPromise = new Promise<never>((_, reject) => {
    cancellationWatcher = setInterval(() => {
      if (!signal?.cancelled) {
        return;
      }

      void task?.cancelAsync().catch(() => undefined);
      reject(new Error("Upload cancelado pelo usuario."));
    }, 200);
  });

  try {
    task = FileSystem.createUploadTask(
      url,
      fileUri,
      {
        httpMethod: "PUT",
        headers: { "Content-Type": mimeType },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      },
      (data) => {
        if (signal?.cancelled) {
          void task?.cancelAsync().catch(() => undefined);
          return;
        }

        if (onProgress && data.totalBytesExpectedToSend > 0) {
          const fraction = Math.min(
            1,
            data.totalBytesSent / data.totalBytesExpectedToSend,
          );
          onProgress(fraction);
        }
      },
    );

    if (signal?.cancelled) {
      await task.cancelAsync();
      throw new Error("Upload cancelado pelo usuario.");
    }

    const result = await Promise.race([
      task.uploadAsync(),
      timeoutPromise,
      cancelPromise,
    ]);

    if (!result) {
      throw new Error("Upload cancelado");
    }

    return result;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (cancellationWatcher) clearInterval(cancellationWatcher);
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  label: string,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status;
      const retryable =
        isTransientError(err) || (status >= 500 && status < 600);
      if (attempt >= maxRetries || !retryable) throw err;

      const backoff = Math.min(1000 * 2 ** attempt, 8000);
      logUpload("retry_scheduled", {
        label,
        attempt: attempt + 1,
        backoff,
        message: err?.message,
      });
      await sleep(backoff);
    }
  }
  throw lastError;
}

async function ensureOnline(): Promise<void> {
  const net = await Network.getNetworkStateAsync();
  if (!net.isConnected || net.isInternetReachable === false) {
    throw new Error("Sem conexao com a internet");
  }
}

async function uploadPreparedFileToSignedUrl(
  prepared: NormalizedUploadFile,
  uploadUrl: string,
  options?: UploadOptions,
): Promise<{ result: FileSystem.FileSystemUploadResult; finalUrl: string }> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;

  const startedAt = Date.now();
  const result = await withRetry(
    () =>
      uploadWithProgress(
        uploadUrl,
        prepared.uri,
        prepared.mimeType,
        timeoutMs,
        options?.signal,
        options?.onProgress,
      ),
    maxRetries,
    "signed-url-upload",
  );

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Falha no upload do S3. Status: ${result.status}`);
  }

  options?.onProgress?.(1);

  const finalUrl = uploadUrl.split("?")[0] || uploadUrl;
  logUpload("upload_completed", {
    originalUri: prepared.originalUri,
    safeUri: prepared.uri,
    mimeType: prepared.mimeType,
    size: prepared.size,
    httpStatus: result.status,
    elapsedMs: Date.now() - startedAt,
    finalUrl,
  });

  return { result, finalUrl };
}

async function performS3Upload({
  file,
  options,
}: UploadFileParams): Promise<string> {
  const prepared = await prepareUploadFile(file);
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;

  try {
    await ensureOnline();

    const { upload_url, final_url } = await withRetry(
      () => solicitarLinkS3(prepared.name, prepared.mimeType),
      maxRetries,
      "presigned-url",
    );

    if (!upload_url || !final_url) {
      throw new Error("Nao foi possivel obter a URL de upload.");
    }

    if (options?.signal?.cancelled) {
      throw new Error("Upload cancelado pelo usuario.");
    }

    const startedAt = Date.now();
    const uploadResult = await withRetry(
      () =>
        uploadWithProgress(
          upload_url,
          prepared.uri,
          prepared.mimeType,
          timeoutMs,
          options?.signal,
          options?.onProgress,
        ),
      maxRetries,
      "s3-upload",
    );

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Falha no upload do S3. Status: ${uploadResult.status}`);
    }

    options?.onProgress?.(1);

    logUpload("upload_completed", {
      originalUri: prepared.originalUri,
      safeUri: prepared.uri,
      fileName: prepared.name,
      mimeType: prepared.mimeType,
      size: prepared.size,
      elapsedMs: Date.now() - startedAt,
      httpStatus: uploadResult.status,
      finalUrl: final_url,
    });

    return final_url;
  } finally {
    await prepared.cleanup().catch((error) => {
      logUploadError("cleanup_prepared_file", error, {
        safeUri: prepared.uri,
      });
    });
  }
}

export async function safeUploadImage({
  file,
  options,
}: UploadFileParams): Promise<string> {
  const normalized = normalizeInput(file);
  const mimeType = inferMimeType(normalized.uri, normalized.mimeType);
  if (!mimeType.startsWith("image/")) {
    throw new Error("safeUploadImage aceita apenas imagens.");
  }

  return performS3Upload({
    file: {
      ...normalized,
      mimeType,
    },
    options,
  });
}

export async function uploadFileToS3({
  file,
  options,
}: UploadFileParams): Promise<string> {
  try {
    return await performS3Upload({ file, options });
  } catch (error: any) {
    logUploadError("upload_file_to_s3", error, {
      file:
        typeof file === "string"
          ? file.slice(0, 80)
          : {
              uri: file.uri,
              name: file.name,
              mimeType: file.mimeType || file.type,
            },
    });
    const msg = friendlyMessage(error);
    if (msg) {
      Alert.alert("Erro no upload", msg);
    }
    throw error;
  }
}

export async function uploadRawFile(file: {
  uri: string;
  name?: string;
  type?: string;
  mimeType?: string;
}) {
  return uploadFileToS3({
    file: {
      uri: file.uri,
      name: file.name,
      mimeType: file.mimeType || file.type,
    },
  });
}

export async function uploadRawFileToSignedUrl(
  file: UploadFileLike,
  uploadUrl: string,
  options?: UploadOptions,
) {
  const prepared = await prepareUploadFile(file);

  try {
    await ensureOnline();
    const { finalUrl } = await uploadPreparedFileToSignedUrl(
      prepared,
      uploadUrl,
      options,
    );
    return finalUrl;
  } catch (error: any) {
    logUploadError("upload_raw_file_to_signed_url", error, {
      uploadUrl: uploadUrl.split("?")[0],
      fileName: prepared.name,
      mimeType: prepared.mimeType,
    });
    const msg = friendlyMessage(error);
    if (msg) {
      Alert.alert("Erro no upload", msg);
    }
    throw error;
  } finally {
    await prepared.cleanup().catch((error) => {
      logUploadError("cleanup_prepared_file", error, {
        safeUri: prepared.uri,
      });
    });
  }
}
