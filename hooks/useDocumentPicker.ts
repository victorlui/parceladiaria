import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

type FileType = "pdf" | "image" | "video";


interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
  type: FileType;
}

export function useDocumentPicker(maxSizeMB: number = 10) {
  const checkFileSize = async (uri: string) => {
    const info: FileSystem.FileInfo = await FileSystem.getInfoAsync(uri);
    return (
      info.exists &&
      "size" in info &&
      (info as { size: number }).size < maxSizeMB * 1024 * 1024
    );
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === "granted" && mediaStatus === "granted";
  };

  const selectPDF = async (customName?: string): Promise<SelectedFile | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const file = result.assets[0];
      if (await checkFileSize(file.uri)) {
        return {
          uri: file.uri,
          name: customName || file.name,

          mimeType: file.mimeType || "application/pdf",
          type: "pdf",
        };
      }
    }
    return null;
  };

  const takePhoto = async (
    from: "camera" | "library",
    customName?: string

  ): Promise<SelectedFile | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const picker =
      from === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await picker({ quality: 0.8, allowsEditing: true });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (await checkFileSize(asset.uri)) {
        return {
          uri: asset.uri,
          name: customName || `document_${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          type: "image",
        };
      }
    }
    return null;
  };

  const takeVideo = async (
    from: "camera" | "library",
    customName?: string
  ): Promise<SelectedFile | null> => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const picker =
      from === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await picker({
      quality: 1,
      mediaTypes: 'videos',
    });

    

    if (!result.canceled) {
      const asset = result.assets[0];
      if (result.assets?.[0]?.type !== 'video' && await checkFileSize(asset.uri)) {
        return {
          uri: asset.uri,
          name: customName || `video_${Date.now()}.mp4`,

          mimeType: "video/mp4",
          type: "video",
        };
      }else if(result.assets?.[0]?.type === 'video'){
         return {
          uri: asset.uri,
          name: customName || `video_${Date.now()}.mp4`,

          mimeType: "video/mp4",
          type: "video",
        };
      } else {
        Alert.alert("Atenção", "O arquivo é maior que 10MB. Por favor, selecione um arquivo menor.")
        return null
      }
    }
    return null;
  };

 

  return { selectPDF, takePhoto,takeVideo };
}
