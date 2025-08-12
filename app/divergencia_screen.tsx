import { useAuthStore } from "@/store/auth";
import React, { useState } from "react";
import { ScrollView, Text, View, Image, Alert, Dimensions, TouchableOpacity } from "react-native";
import { Button } from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { updateUserService } from "@/services/register";
import { router } from "expo-router";
import Spinner from "@/components/Spinner";
import DrawerMenu from "@/components/DrawerMenu";

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function DivergenciaScreen() {
  const { user, logout } = useAuthStore();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  
  const { takePhoto } = useDocumentPicker(10);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuPress = () => {
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

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
      className="flex-1 bg-gradient-to-b from-blue-50 to-white"
    >
      {/* Container principal com padding responsivo */}
      <View className={`flex-1 ${isTablet ? 'px-12 py-8' : 'px-6 py-4'}`}>
        
        {/* Header com logo e menu */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity 
            onPress={handleMenuPress}
            className="p-2"
          >
            <Ionicons name="menu" size={28} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <Image 
              source={require("@/assets/images/apenas-logo.png")} 
              className={`w-full ${isTablet ? 'h-32' : 'h-24'}`}
              resizeMode="contain" 
            />
          </View>
          
          <View className="w-12" />
        </View>

        {/* Card com informações de divergência */}
        <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-6 border border-gray-100">
          <View className="items-center">
            {/* Ícone de status */}
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-yellow-100">
              <Text className="text-2xl text-yellow-600">
                ⚠️
              </Text>
            </View>

            {/* Título principal */}
            <Text className={`font-bold text-center mb-3 ${
              isTablet ? 'text-3xl' : 'text-2xl'
            } text-gray-800 leading-tight`}>
              Divergências Encontradas
            </Text>

            {/* Subtítulo */}
            <Text className={`text-center text-gray-600 leading-relaxed ${
              isTablet ? 'text-lg' : 'text-base'
            }`}>
              Verifique os documentos abaixo e envie-os novamente para verificação.
            </Text>

            {/* Badge de status */}
            <View className="mt-4 px-4 py-2 rounded-full bg-yellow-100">
              <Text className="font-semibold text-sm text-yellow-800">
                PENDENTE CORREÇÃO
              </Text>
            </View>
          </View>
        </View>

        {/* Conteúdo de documentos */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="px-4">
            {renderDocumentRequests()}
          </View>

          <View className="gap-5 px-4 py-6">
            <Button
              title="Enviar documentos"
              onPress={handleSubmitDocuments}
              disabled={Object.keys(selectedFiles).length === 0 || isLoading}
            />
          </View>
        </ScrollView>

      </View>
      
      {/* DrawerMenu */}
      <DrawerMenu 
        isVisible={isDrawerVisible} 
        onClose={handleCloseDrawer}
        showOnlyLogout={true}
      />
    </SafeAreaView>
    </>
   
  );
}
