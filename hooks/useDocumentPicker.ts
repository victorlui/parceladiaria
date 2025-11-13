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
  // Para vídeos, usamos um limite muito maior (20x o limite padrão)
  const maxVideoSizeMB = maxSizeMB * 20; // Aumentado de 5x para 20x
  const getFileInfoSafe = async (uri: string) => {
    try {
      // preferir statAsync se existir
      if (typeof (FileSystem as any).statAsync === "function") {
        return await (FileSystem as any).statAsync(uri);
      }
      // fallback para getInfoAsync (versões antigas)
      if (typeof (FileSystem as any).getInfoAsync === "function") {
        return await (FileSystem as any).getInfoAsync(uri);
      }
      // nada disponível
      console.warn(
        "expo-file-system: nem statAsync nem getInfoAsync disponíveis."
      );
      return null;
    } catch (err) {
      console.warn("Erro em getFileInfoSafe:", err);
      return null;
    }
  };

  const checkFileSize = async (
    uri: string,
    customMaxSize?: number
  ): Promise<{ valid: boolean; fixedUri: string }> => {
    try {
      const sizeLimit = (customMaxSize ?? maxSizeMB) * 1024 * 1024;

      // tentativa 1: obtém info direto (pode funcionar se uri for file://)
      const info1 = await getFileInfoSafe(uri);
      if (info1 && typeof info1.size === "number") {
        const valid = info1.size < sizeLimit;
        return { valid, fixedUri: uri };
      }

      // tentativa 2: copiar para cache (se cacheDirectory existir e copyAsync disponível)
      const cacheDir =
        (FileSystem as any).cacheDirectory ??
        (FileSystem as any).documentDirectory ??
        null;

      if (cacheDir && typeof (FileSystem as any).copyAsync === "function") {
        const fileName = uri.split("/").pop() || `temp_${Date.now()}`;
        const dest = `${cacheDir}${fileName}`;

        try {
          await (FileSystem as any).copyAsync({ from: uri, to: dest });
          const info2 = await getFileInfoSafe(dest);
          if (info2 && typeof info2.size === "number") {
            const valid = info2.size < sizeLimit;
            return { valid, fixedUri: dest };
          }
        } catch (copyErr) {
          console.warn("copyAsync falhou:", copyErr);
          // continua para fallback
        }
      }

      // tentativa 3: como último recurso, se info1 não deu e não conseguimos copiar,
      // retornamos invalid (não conseguimos garantir tamanho). Log para debug.
      console.warn(
        "Não foi possível obter tamanho do arquivo. URI:",
        uri,
        " - Considere atualizar expo-file-system ou verificar permissões."
      );
      return { valid: false, fixedUri: uri };
    } catch (error) {
      console.error("Erro ao verificar tamanho do arquivo:", error);
      return { valid: false, fixedUri: uri };
    }
  };

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permissões necessárias",
          "Para usar esta funcionalidade, é necessário permitir o acesso à câmera e galeria."
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao solicitar permissões:", error);
      return false;
    }
  };

  const selectPDF = async (
    customName?: string
  ): Promise<SelectedFile | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];
        const isValidSize = await checkFileSize(file.uri);

        if (!isValidSize) {
          Alert.alert(
            "Arquivo muito grande",
            `O arquivo PDF deve ter no máximo ${maxSizeMB}MB. Por favor, selecione um arquivo menor.`
          );
          return null;
        }

        return {
          uri: file.uri,
          name: customName || file.name,
          mimeType: file.mimeType || "application/pdf",
          type: "pdf",
        };
      }
    } catch (error) {
      console.error("Erro ao selecionar PDF:", error);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo PDF.");
    }

    return null;
  };

  const takePhoto = async (
    from: "camera" | "library",
    customName?: string
  ): Promise<SelectedFile | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const picker =
        from === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await picker({
        quality: 0.8,
        allowsEditing: true,
        mediaTypes: "images",

        cameraType: ImagePicker.CameraType.back,
      });

      console.log("result", result);

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        // const isValidSize = await checkFileSize(asset.uri, maxSizeMB * 3);
        // console.log("isValidSize", isValidSize);
        // if (!isValidSize) {
        //   Alert.alert(
        //     "Imagem muito grande",
        //     `A imagem deve ter no máximo ${maxSizeMB}MB. Por favor, tire uma nova foto ou selecione uma imagem menor.`
        //   );
        //   return null;
        // }

        // console.log("asset", asset);

        return {
          uri: asset.uri,
          name: customName || `photo_${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          type: "image",
        };
      }
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      Alert.alert("Erro", "Não foi possível capturar a foto.");
    }

    return null;
  };

  const takeVideo = async (
    from: "camera" | "library",
    customName?: string
  ): Promise<SelectedFile | null> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const picker =
        from === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await picker({
        quality: 0.5, // Aumentado de 0 para 0.5 para melhor qualidade
        mediaTypes: "videos", // Corrigido para usar a constante correta
        videoMaxDuration: 120, // 2 minutos máximo (conforme solicitado anteriormente)
        allowsEditing: false, // Adicionado para evitar problemas de edição
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Low, // Aumentado de 0 para 0.5 para melhor qualidade
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];

        // Para vídeos, usamos o limite maior
        const isValidSize = await checkFileSize(asset.uri, maxVideoSizeMB);

        if (!isValidSize) {
          Alert.alert(
            "Vídeo muito grande",
            `O vídeo deve ter no máximo ${maxVideoSizeMB}MB. Por favor, grave um vídeo menor ou reduza a qualidade.`
          );
          return null;
        }

        return {
          uri: asset.uri,
          name: customName || `video_${Date.now()}.mp4`,
          mimeType: "video/mp4",
          type: "video",
        };
      }
    } catch (error) {
      console.error("Erro ao capturar vídeo:", error);
      Alert.alert("Erro", "Não foi possível capturar o vídeo.");
    }

    return null;
  };

  return { selectPDF, takePhoto, takeVideo };
}
