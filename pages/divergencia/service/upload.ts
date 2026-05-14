import { uploadFileToS3 } from "@/hooks/useUploadDocument";

type SupportedFile = {
  uri: string;
  name?: string;
  mimeType?: string;
};

const FILE_TYPES: Record<string, { mimeType: string; extension: string }> = {
  mp4: {
    mimeType: "video/mp4",
    extension: "mp4",
  },
  mov: {
    mimeType: "video/quicktime",
    extension: "mov",
  },
  m4v: {
    mimeType: "video/x-m4v",
    extension: "m4v",
  },
  jpg: {
    mimeType: "image/jpeg",
    extension: "jpg",
  },
  jpeg: {
    mimeType: "image/jpeg",
    extension: "jpg",
  },
  png: {
    mimeType: "image/png",
    extension: "png",
  },
  pdf: {
    mimeType: "application/pdf",
    extension: "pdf",
  },
};

const MIME_TO_EXTENSION: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-m4v": "m4v",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

function getExtension(value?: string | null): string | null {
  if (!value) return null;
  const clean = String(value).split("?")[0].split("#")[0];
  const last = clean.split("/").pop() ?? clean;
  const parts = last.split(".");
  if (parts.length < 2) return null;
  const ext = parts.pop()?.toLowerCase() ?? null;
  return ext || null;
}

function stripExtension(value: string): string {
  return value.replace(/\.[^.]+$/, "");
}

export const uploadDocumentService = async (
  file: SupportedFile,
): Promise<string> => {
  try {
    const rawUri = file.uri;
    const uriLower = rawUri.toLowerCase();

    const mimeFromDataUri = uriLower.startsWith("data:")
      ? rawUri.match(/data:([^;]+)/)?.[1]
      : undefined;
    const rawMimeType = (file.mimeType || mimeFromDataUri || "").toLowerCase();

    const extFromMime = rawMimeType ? MIME_TO_EXTENSION[rawMimeType] : null;
    const extFromName = getExtension(file.name);
    const extFromUri = getExtension(rawUri);

    const extension = extFromMime || extFromName || extFromUri || "bin";
    const fallbackMimeType =
      FILE_TYPES[extension]?.mimeType || "application/octet-stream";
    const mimeType =
      rawMimeType && rawMimeType !== "application/octet-stream"
        ? rawMimeType
        : fallbackMimeType;

    const originalName = (file.name || "arquivo").trim() || "arquivo";
    const baseName = stripExtension(originalName);
    const fileName = `${baseName}_${Date.now()}.${extension}`;

    const finalUrl = await uploadFileToS3({
      file: {
        uri: rawUri,
        name: fileName,
        mimeType,
      },
    });
    if (!finalUrl) {
      throw new Error("Não foi possível enviar o arquivo.");
    }
    return finalUrl;
  } catch (error) {
    throw error;
  }
};
