import { Selected } from "../components/SendDocument";

export function safeParseArray(str: any) {
  if (!str) return [];
  try {
    str = str.replace(/,\s*]$/, "]");
    return JSON.parse(str);
  } catch (e) {
    console.error("Erro ao parsear divergencias:", e);
    return [];
  }
}

export const getInitialSelectedForItem = (
  documentKey: string,
  selectedFiles: Record<string, { key: string; selected?: Selected }>,
): Selected | null => {
  const entry = selectedFiles[documentKey];
  if (entry?.selected) return entry.selected;
  if (!entry?.key) return null;

  const uri = entry.key;
  const cleanUri = uri.split("?")[0].toLowerCase();
  const isPdf = cleanUri.endsWith(".pdf");
  const isVideo =
    cleanUri.endsWith(".mp4") ||
    cleanUri.endsWith(".mov") ||
    cleanUri.endsWith(".m4v");

  const type: Selected["type"] = isVideo ? "video" : isPdf ? "pdf" : "image";
  const name = uri.split("/").pop()?.split("?")[0] ?? "arquivo";
  const mimeType = isVideo
    ? "video/mp4"
    : isPdf
      ? "application/pdf"
      : "image/jpeg";

  return { uri, name, type, mimeType };
};
