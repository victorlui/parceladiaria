import { solicitarLinkS3 } from "@/services/upload-files";
import * as FileSystem from "expo-file-system/legacy";
import * as Network from "expo-network";
import { Alert } from "react-native";

type UploadFileParams = {
  file: {
    uri: string;
    name?: string;
    mimeType?: string;
  };
  options?: {
    /** Tempo limite de uma única tentativa de upload (ms). Padrão: 60s. */
    timeoutMs?: number;
    /** Quantas tentativas extras após a primeira. Padrão: 2. */
    maxRetries?: number;
    /** Flag simples para cancelamento externo (ex.: unmount do componente). */
    signal?: { cancelled: boolean };
    /** Callback chamado com a fração enviada (0..1) durante o upload. */
    onProgress?: (fraction: number) => void;
  };
};

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_RETRIES = 2;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Erros considerados transitórios (rede oscilando, timeout, DNS, etc.). */
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
  if (error?.response?.status === 401) return ""; // silencioso
  const msg = String(error?.message || "").toLowerCase();
  if (msg.includes("cancelado")) return "";
  if (msg.includes("sem conexão") || msg.includes("offline")) {
    return "Você está offline. Verifique sua internet e tente novamente.";
  }
  if (msg.includes("tempo limite") || msg.includes("timeout")) {
    return "Conexão lenta ou instável. Tente novamente em uma rede melhor.";
  }
  if (msg.includes("muito grande") || msg.includes("max_file_size")) {
    return "Arquivo muito grande. Selecione um arquivo menor.";
  }
  if (msg.includes("não encontrado") || msg.includes("not found")) {
    return "Arquivo não encontrado no dispositivo. Selecione outro e tente novamente.";
  }
  return "Não foi possível enviar o arquivo. Verifique sua conexão e tente novamente.";
}

/** Regex para detectar URI data:base64 e extrair mime + payload. */
const DATA_URI_RE = /^data:([^;,]+);base64,(.*)$/;

/** Extensão padrão por MIME type, usada no arquivo temporário do cache. */
function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "application/pdf": "pdf",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
  };
  const key = mime.toLowerCase().split(";")[0].trim();
  return map[key] || key.split("/")[1] || "bin";
}

/**
 * Se `uri` for `data:...;base64,...`, escreve o conteúdo num arquivo temporário
 * no cache e retorna esse caminho + função de limpeza. Caso contrário, retorna
 * a URI original sem side-effects.
 *
 * Necessário porque `createUploadTask` precisa de um caminho de arquivo real
 * (file:// ou tmp) — não aceita base64 inline. Para fotos de reconhecimento
 * facial (~50KB) o custo de escrita no cache é desprezível.
 */
async function materializeFileUri(
  uri: string,
  fallbackMimeType: string,
): Promise<{
  uri: string;
  mimeType: string;
  cleanup: () => Promise<void>;
}> {
  if (!uri.startsWith("data:")) {
    return { uri, mimeType: fallbackMimeType, cleanup: async () => {} };
  }

  const match = DATA_URI_RE.exec(uri);
  if (!match) {
    throw new Error(
      "Formato de imagem não suportado (esperado data:image/...;base64,...)",
    );
  }
  const mimeFromUri = match[1];
  const base64Data = match[2];

  if (!base64Data) {
    throw new Error("Conteúdo da imagem vazio.");
  }

  const mimeType =
    mimeFromUri || fallbackMimeType || "application/octet-stream";
  const ext = extFromMime(mimeType);
  const tempPath = `${FileSystem.cacheDirectory}upload_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  await FileSystem.writeAsStringAsync(tempPath, base64Data, {
    encoding: "base64",
  });

  if (__DEV__) {
    const info = await FileSystem.getInfoAsync(tempPath);
    console.log("[upload] data:URI materializada em", tempPath, info);
  }

  return {
    uri: tempPath,
    mimeType,
    cleanup: async () => {
      try {
        await FileSystem.deleteAsync(tempPath, { idempotent: true });
      } catch (err) {
        if (__DEV__) console.warn("[upload] falha ao remover temp:", err);
      }
    },
  };
}

/**
 * Upload via `createUploadTask` (suporta callback de progresso nativo)
 * envolvido por `Promise.race` para impor um timeout duro.
 */
async function uploadWithProgress(
  url: string,
  fileUri: string,
  mimeType: string,
  timeoutMs: number,
  onProgress?: (fraction: number) => void,
): Promise<FileSystem.FileSystemUploadResult> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Upload excedeu o tempo limite de ${Math.round(timeoutMs / 1000)}s`,
        ),
      );
    }, timeoutMs);
  });

  try {
    const task = FileSystem.createUploadTask(
      url,
      fileUri,
      {
        httpMethod: "PUT",
        headers: { "Content-Type": mimeType },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      },
      (data) => {
        if (onProgress && data.totalBytesExpectedToSend > 0) {
          const fraction = Math.min(
            1,
            data.totalBytesSent / data.totalBytesExpectedToSend,
          );
          onProgress(fraction);
        }
      },
    );

    const result = await Promise.race([task.uploadAsync(), timeoutPromise]);

    // uploadAsync resolve com undefined/null se a task for cancelada
    if (!result) {
      throw new Error("Upload cancelado");
    }

    return result;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/** Tenta `fn` até `maxRetries` vezes com backoff exponencial em erros transitórios. */
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
      if (__DEV__) {
        console.warn(
          `[upload] ${label} tentativa ${attempt + 1} falhou, tentando em ${backoff}ms`,
          err?.message,
        );
      }
      await sleep(backoff);
    }
  }
  throw lastError;
}

export async function uploadFileToS3({ file, options }: UploadFileParams) {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const signal = options?.signal;
  const onProgress = options?.onProgress;

  // Materializa a URI: se vier `data:image/jpeg;base64,...` (ex.: reconhecimento
  // facial) grava em arquivo temporário no cache; caso contrário usa a URI real.
  const materialized = await materializeFileUri(file.uri, file.mimeType || "");
  const fileUri = materialized.uri;
  const mimeType = materialized.mimeType;

  try {
    // 1. Checa rede antes de gastar tempo com o link do S3.
    const net = await Network.getNetworkStateAsync();
    if (!net.isConnected || net.isInternetReachable === false) {
      throw new Error("Sem conexão com a internet");
    }

    // 2. Valida arquivo local sem carregar o BLOB na memória.
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("Arquivo não encontrado no dispositivo.");
    }
    if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
      throw new Error("Arquivo muito grande");
    }

    // 3. Solicita URL pré-assinada (com retry para 5xx/transitórios).
    const { upload_url, final_url } = await withRetry(
      () => solicitarLinkS3(file.name || "", mimeType),
      maxRetries,
      "presigned-url",
    );

    if (signal?.cancelled) throw new Error("Upload cancelado pelo usuário.");

    // 4. Upload com progresso real + timeout duro + retry em erros de rede.
    const uploadResult = await withRetry(
      () =>
        uploadWithProgress(
          upload_url,
          fileUri,
          mimeType,
          timeoutMs,
          onProgress,
        ),
      maxRetries,
      "s3-upload",
    );

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Falha no upload do S3. Status: ${uploadResult.status}`);
    }

    // Garante 100% ao final (algumas implementações não emitem o último evento)
    onProgress?.(1);

    if (__DEV__) console.log("Upload bem-sucedido:", uploadResult);
    return final_url;
  } catch (error: any) {
    const msg = friendlyMessage(error);
    if (msg) Alert.alert("Erro no upload", msg);
    throw error;
  } finally {
    // Remove o arquivo temporário gerado a partir de data:URI (no-op para URIs normais)
    await materialized.cleanup();
  }
}
