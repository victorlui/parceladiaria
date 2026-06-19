import { Selected } from "../components/SendDocument";

export type SelectedFileMap = Record<
  string,
  string | { key: string; selected?: Selected } | undefined
>;

export function safeParseArray(str: any) {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  if (typeof str !== "string") return [];
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
  selectedFiles: SelectedFileMap,
): Selected | null => {
  const entry = selectedFiles[documentKey];
  console.log("selectedFiles", entry);
  console.log("documentKey", documentKey);

  let uri: string | undefined;
  if (typeof entry === "string" && entry.trim()) {
    uri = entry.trim();
  } else if (entry && typeof entry === "object") {
    if (entry.selected) return entry.selected;
    if (entry.key) uri = entry.key;
  }

  if (!uri) return null;

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

export const getSelectedFilesFromData = (
  divergencias: string[],
  data: Record<string, any> | null | undefined,
): SelectedFileMap => {
  return divergencias.reduce<SelectedFileMap>((acc, documentKey) => {
    const value = data?.[documentKey];

    if (typeof value === "string" && value.trim()) {
      acc[documentKey] = { key: value.trim() };
    }

    return acc;
  }, {});
};
