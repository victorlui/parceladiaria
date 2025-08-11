import LayoutRegister from "@/components/ui/LayoutRegister";
import {
  Alert,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Etapas, requestPermissions } from "@/utils";
import * as ImagePicker from "expo-image-picker";
import { solicitarLinkS3 } from "@/services/upload-files";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";

export default function DocumentPhotoFrontScreen() {
  const [selectedDocFront, setSelectedDocFront] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { mutate } = useUpdateUserMutation();

  const checkFileSize = async (uri: any) => {
    const info: any = await FileSystem.getInfoAsync(uri);
    return info.size < 10 * 1024 * 1024;
  };

  const selectPDF = async (type: "front" | "back") => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const file = result.assets[0];
      if (await checkFileSize(file.uri)) {
        setSelectedDocFront({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          type: "pdf",
        });
      }
    }
  };

  const takePhoto = async (from: "camera" | "library") => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const picker =
      from === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    const result = await picker({ quality: 0.8, allowsEditing: true });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (await checkFileSize(asset.uri)) {
        setSelectedDocFront({
          uri: asset.uri,
          name: "documento_comercio_frente.jpg",
          mimeType: "image/jpeg",
          type: "image",
        });
      }
    }
  };

  const onSubmit = async () => {

    if(!selectedDocFront) {
      Alert.alert("Atenção", "Por favor, tire uma foto do documento. ou selecione um pdf");
      return;
    }

    const fileInfo: any = await FileSystem.getInfoAsync(selectedDocFront.uri);
    if (fileInfo.size > 10 * 1024 * 1024) {
      Alert.alert("Arquivo muito grande (máx. 10MB)");
      return;
    }

    try {
      setIsLoading(true);
      const filename = selectedDocFront.name || "documento_comercio_frente.jpg";
      const mimeType = selectedDocFront.mimeType || "image/jpeg";

      const s3Response = await solicitarLinkS3(filename, mimeType);
      const { upload_url, final_url } = s3Response;

      const response = await fetch(selectedDocFront.uri);
      const blob = await response.blob();
      const uploadResult = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: blob,
      });

      if (!uploadResult.ok) {
        throw new Error(`Falha no upload. Status: ${uploadResult.status}`);
      }

      const request = {
        etapa: Etapas.REGISTRANDO_VERSO_DOCUMENTO_COMERCIO,
        foto_frente_doc: final_url,
      };
      mutate({ request: request });
      console.log("uploadResult", uploadResult);
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutRegister
      isLogo={false}
      isBack
      onContinue={onSubmit}
      loading={isLoading}
    >
      <View className="flex-1">
        <Text className="font-semibold text-2xl mb-2">Envio de Documento</Text>
        <Text className="mb-4 text-base">
          Envie uma foto da parte da frente do documento (CPF ou RG) emitido em
          no máximo 10 anos.
        </Text>
        <View>
          <Text className="font-bold text-xl mb-1">Foto frente</Text>
        </View>
        <View className="flex-1">
          {!selectedDocFront && (
            <View className="flex-1">
              <Image
                source={require("../../assets/images/carteira-de-motorista.png")}
                className="w-44 h-44"
                resizeMode="contain"
              />
            </View>
          )}

          {selectedDocFront && (
            <>
              {selectedDocFront.type === "image" ? (
                <View className="w-full flex-1 bg-red-400 h-52 mb-3">
                  <Image
                    source={{ uri: selectedDocFront.uri }}
                    className="w-full h-full"
                  />
                </View>
              ) : (
                <View className="flex-1">
                  <Text className="text-base mt-10">Documento frente: </Text>
                  <Text className="text-xl font-semibold mb-10">
                    {selectedDocFront.name}{" "}
                  </Text>
                </View>
              )}
            </>
          )}

          <View className="flex-2  justify-end gap-5 mb-5">
            <TouchableOpacity
              onPress={() => selectPDF("front")}
              className="bg-gray-200 p-4 rounded-lg items-center justify-center"
            >
              <Text className="text-base">Selecionar documento PDF</Text>
            </TouchableOpacity>
            <Button
              title="Tirar foto"
              variant="secondary"
              onPress={() => {
                takePhoto("camera");
              }}
            />
          </View>
        </View>

        <Text className="text-base mt-2">
          OBS: Documentos emitidos à mais de 10 anos serão rejeitados.
        </Text>
      </View>
    </LayoutRegister>
  );
}
