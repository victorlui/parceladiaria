import {
  type UploadCancelSignal,
  uploadFileToS3,
} from "@/hooks/useUploadDocument";

type SupportedFile = {
  uri: string;
  name?: string;
  mimeType?: string;
};

export const uploadDocumentService = async (
  file: SupportedFile,
  options?: {
    onProgress?: (fraction: number) => void;
    signal?: UploadCancelSignal;
  },
): Promise<string> => {
  try {
    const url = await uploadFileToS3({
      file,
      options,
    });
    return url;
  } catch (error) {
    throw error;
  }
};
