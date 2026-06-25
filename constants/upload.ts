/**
 * Constantes compartilhadas pelo fluxo de upload de documentos.
 * Mantém MIME types, extensões e limites num único lugar para evitar divergências
 * entre hook, service e UI.
 */

export type AllowedMimeType =
  | "video/mp4"
  | "video/quicktime"
  | "video/x-m4v"
  | "image/jpeg"
  | "image/jpg"
  | "image/png"
  | "application/pdf";

export const MAX_FILE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 700;
export const MAX_FILENAME_LENGTH = 80;

export const SUPPORTED_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "m4v",
  "jpg",
  "jpeg",
  "png",
  "pdf",
]);

export const EXTENSION_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export const MIME_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
};

export const VIDEO_MIME_TYPES: AllowedMimeType[] = [
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
];

export const IMAGE_MIME_TYPES: AllowedMimeType[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export const ALL_ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  ...VIDEO_MIME_TYPES,
  ...IMAGE_MIME_TYPES,
  "application/pdf",
];

/**
 * Mapeia o MIME para um tipo de arquivo de UI.
 */
export function fileTypeFromMime(mime: string): "pdf" | "image" | "video" {
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "image";
}

/**
 * Gera mensagem amigável para erros de validação do upload.
 */
export function getFriendlyUploadError(error: unknown): string {
  if (!error) return "Não foi possível enviar o arquivo. Tente novamente.";
  const e = error as { name?: string; code?: string; message?: string };
  if (e.name === "UploadCancelledError") {
    return "Envio cancelado.";
  }
  switch (e.code) {
    case "FILE_TOO_LARGE":
      return "Arquivo muito grande. Selecione um arquivo menor.";
    case "UNSUPPORTED_EXTENSION":
      return "Tipo de arquivo não suportado.";
    case "FILE_NOT_FOUND":
      return "Arquivo não encontrado no dispositivo.";
    case "EMPTY_URI":
      return "Arquivo inválido.";
    case "NO_TOKEN":
      return "Sessão expirada. Faça login novamente.";
    case "INVALID_PRESIGN_RESPONSE":
      return "Não foi possível obter a URL de upload. Tente novamente.";
    case "UPLOAD_HTTP_ERROR":
      return e.message ?? "Falha ao enviar o arquivo.";
    default:
      return e.message ?? "Não foi possível enviar o arquivo. Tente novamente.";
  }
}
