import { useAuthStore } from "@/store/auth";
import { ScrollView, Text, View, Image, Alert } from "react-native";
import { Button } from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { updateUserService } from "@/services/register";
import { router } from "expo-router";
import Spinner from "@/components/Spinner";

export default function RecusadoScreen() {
  const { user,logout } = useAuthStore();
  
  const { takePhoto } = useDocumentPicker(10);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  function safeParseArray(str: any) {
    if (!str) return [];
    try {
      str = str.replace(/,\s*]$/, "]");
      return JSON.parse(str);
    } catch (e) {
      console.error("Erro ao parsear divergencias:", e);
      return [];
    }
  }

  const divergenciasArray = safeParseArray(user?.divergencias);

  // Map of document types to their display names
  const documentDisplayNames: Record<string, string> = {
    comprovante_endereco: "Comprovante de endereço",
    foto_perfil_app: "Foto de perfil do aplicativo",
    foto_perfil_app2: "Segunda foto de perfil do aplicativo",
    foto_docveiculo: "Documento do veiculo",
    foto_veiculo: "Selfie junto com veiculo",
    video_comercio: "Vídeo do comercio",
    ganhos_app: "Ganhos no aplicativo",
    foto_frente_doc: "Foto frente do documento",
    foto_verso_doc: "Foto verso do documento",
    fachada: "Foto da fachada",
    mei: "Certificado de MEI",
    face: "Reconhecimento facial",
  };

  const pickImage = async (documentType: string) => {
    const result = await takePhoto("library");

    if (result && result.uri) {
      setSelectedFiles((prev) => ({
        ...prev,
        [documentType]: result.uri,
      }));
    }
  };

  const handleSubmitDocuments = async () => {
    setIsLoading(true);
    try {
      const uploadedFiles: Record<string, string> = {};

      // Faz upload de cada arquivo selecionado
      for (const [key, uri] of Object.entries(selectedFiles)) {
        const uploadedUrl = await uploadFileToS3({
          file: { uri, name: "file.jpg", mimeType: "image/jpeg" },
        });
        uploadedFiles[key] = uploadedUrl; // salva a URL retornada do S3
      }

      const requestData = {
        etapa: Etapas.FINALIZADO,
        ...uploadedFiles,
      };


      await updateUserService({ request: requestData });
      Alert.alert(
        "Sucesso",
        `${Object.keys(selectedFiles).length === 1 
          ? "O documento foi enviado com sucesso para reanalise"
          : "Os documentos foram enviados com sucesso para reanalise"}`
      );
      logout()
      router.replace('/login')

    } catch (error) {
      console.error("Error uploading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render document request sections based on divergencias
  const renderDocumentRequests = () => {
    return divergenciasArray.map((item: string, index: number) => (
      <View
        key={index}
        className="border border-dashed gap-3 rounded-md p-3 mt-5 w-full"
      >
        <Text className="text-[17px] font-semibold">
          {documentDisplayNames[item] || item}
        </Text>

        {selectedFiles[item] ? (
          <View className="gap-3">
            <Image
              source={{ uri: selectedFiles[item] }}
              className="w-full h-48 rounded-md"
              resizeMode="cover"
            />
            <Button
              title="Trocar arquivo"
              variant="outline"
              onPress={() => pickImage(item)}
            />
          </View>
        ) : (
          <Button
            title="Escolher arquivo"
            variant="outline"
            onPress={() => pickImage(item)}
          />
        )}
      </View>
    ));
  };

  return (
    <>
     {isLoading && <Spinner />}
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1  bg-white py-5 px-5"
    >
        

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
      >
        <View>
          <Text className="text-3xl font-bold">Divergências</Text>
          <Text className="text-base ">
            Verifique os documentos abaixo e envie-os novamente para
            verificação.
          </Text>
        </View>

        <View className="flex-1">{renderDocumentRequests()}</View>

        <View className="">
          <Button
            title="Enviar documentos"
            onPress={handleSubmitDocuments}
            disabled={Object.keys(selectedFiles).length === 0 || isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
   
  );
}
