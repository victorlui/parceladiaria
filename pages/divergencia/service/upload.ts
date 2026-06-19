import { uploadFileToS3 } from "@/hooks/useUploadDocument";

type SupportedFile = {
  uri: string;
  name?: string;
  mimeType?: string;
};

export const uploadDocumentService = async (
  file: SupportedFile,
  onProgress?: (fraction: number) => void,
): Promise<string> => {
  try {
    const url = await uploadFileToS3({
      file,
      options: { onProgress },
    });
    return url;
  } catch (error) {
    throw error;
  }
};
