import { uploadFileToS3 } from "@/hooks/useUploadDocument";

export const upladoDocumentService = async (file: any): Promise<string> => {
  try {
    let mimeType: string;
    let extension: string;

    if (file.uri.toLowerCase().endsWith(".mp4")) {
      mimeType = "video/mp4";
      extension = "mp4";
    } else if (
      file.uri.toLowerCase().endsWith(".jpg") ||
      file.uri.toLowerCase().endsWith(".jpeg")
    ) {
      mimeType = "image/jpeg";
      extension = "jpg";
    } else if (file.uri.toLowerCase().endsWith(".png")) {
      mimeType = "image/png";
      extension = "png";
    } else if (file.uri.startsWith("data:image/")) {
      mimeType = file.uri.match(/data:([^;]+)/)?.[1] || "image/jpeg";
      extension = mimeType.split("/")[1] === "png" ? "png" : "jpg";
    } else {
      mimeType = "application/octet-stream";
      extension = "bin";
    }

    // Gera nome único baseado no tipo de documento e timestamp
    const timestamp = Date.now();
    const fileName = `${file.name}_${timestamp}.${extension}`;

    const uploadedUrl = await uploadFileToS3({
      file: { uri: file.uri, name: fileName, mimeType },
    });
    return uploadedUrl;
  } catch (error) {
    throw error;
  }
};
