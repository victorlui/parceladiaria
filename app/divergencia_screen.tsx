import { useAuthStore } from "@/store/auth";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  Alert,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Button } from "@/components/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Etapas } from "@/utils";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { updateUserService } from "@/services/register";
import { router } from "expo-router";
import Spinner from "@/components/Spinner";
import DrawerMenu from "@/components/DrawerMenu";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const isTablet = width > 768;

export default function DivergenciaScreen() {
  const { user, logout } = useAuthStore();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [documentsModalVisible, setDocumentsModalVisible] = useState(false);

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

  const takeCameraPhoto = async (documentType: string) => {
    const result = await takePhoto("camera");

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
        // Gera nome único baseado no tipo de documento e timestamp
        const timestamp = Date.now();
        const fileName = `${key}_${timestamp}.jpg`;
        
        const uploadedUrl = await uploadFileToS3({
          file: { uri, name: fileName, mimeType: "image/jpeg" },
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
        `${
          Object.keys(selectedFiles).length === 1
            ? "O documento foi enviado com sucesso para reanalise"
            : "Os documentos foram enviados com sucesso para reanalise"
        }`
      );
      logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error uploading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render document request sections based on divergencias
  const renderDocumentRequests = () => {
    return divergenciasArray.map((item: string, index: number) => {
      const isFaceRecognition = item === 'face';
      
      return (
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
                title={isFaceRecognition ? "Tirar nova foto" : "Trocar arquivo"}
                variant="outline"
                onPress={() => {
                  if (isFaceRecognition) {
                    takeCameraPhoto(item);
                  } else {
                    pickImage(item);
                  }
                }}
              />
            </View>
          ) : (
            <>
              {isFaceRecognition ? (
                <Button
                  title="Tirar foto"
                  variant="outline"
                  onPress={() => takeCameraPhoto(item)}
                />
              ) : (
                <Button
                  title="Escolher arquivo"
                  variant="outline"
                  onPress={() => pickImage(item)}
                />
              )}
            </>
          )}
        </View>
      );
    });
  };

    // Adicionar esta função helper após as outras funções
  const areAllDocumentsSelected = () => {
    return divergenciasArray.every((docType: string) => selectedFiles[docType]);
  };

  return (
    <>
      {isLoading && <Spinner />}
      <SafeAreaView
        className="flex-1 "
        style={{ backgroundColor: Colors.dark.background }}
      >
        {/* Container principal com padding responsivo */}
        <View
          className={`flex-1 ${isTablet ? "px-12 py-8" : "px-6 py-4"}`}
          style={{ backgroundColor: "#fff" }}
        >
          {/* Header com logo e menu */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={handleMenuPress} className="p-2">
              <Ionicons name="menu" size={28} color="#374151" />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Image
                source={require("@/assets/images/apenas-logo.png")}
                className={`w-full ${isTablet ? "h-32" : "h-24"}`}
                resizeMode="contain"
              />
            </View>

            <View className="w-12" />
          </View>

          {/* Card principal com informações de divergência */}
          <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-6 border border-gray-100">
            <View className="items-center">
              {/* Ícone de status */}
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-yellow-100">
                <Text className="text-2xl text-yellow-600">⚠️</Text>
              </View>

              {/* Título principal */}
              <Text
                className={`font-bold text-center mb-3 ${
                  isTablet ? "text-3xl" : "text-2xl"
                } text-gray-800 leading-tight`}
              >
                Divergências Encontradas
              </Text>

              {/* Subtítulo */}
              <Text
                className={`text-center text-gray-600 leading-relaxed ${
                  isTablet ? "text-lg" : "text-base"
                }`}
              >
                Alguns documentos precisam ser reenviados para análise.
              </Text>

              {/* Badge de status */}
              <View className="mt-4 px-4 py-2 rounded-full bg-yellow-100">
                <Text className="font-semibold text-sm text-yellow-800">
                  PENDENTE CORREÇÃO
                </Text>
              </View>
            </View>
          </View>

          {/* Conteúdo central simplificado */}
          <View className="flex-1 justify-center items-center px-4">
            {/* Informações adicionais */}
            <View className="bg-white rounded-2xl shadow-lg p-6  mb-8 border border-gray-100">
              <View className="items-center">
                <Text
                  className={`text-center text-gray-600 leading-relaxed ${
                    isTablet ? "text-lg" : "text-base"
                  } mb-6`}
                >
                  Identificamos algumas divergências em seus documentos. Para
                  continuar com o processo, você precisa reenviar os documentos
                  solicitados.
                </Text>

                <Text
                  className={`text-center text-gray-500 ${
                    isTablet ? "text-base" : "text-sm"
                  }`}
                >
                  Clique no botão abaixo para visualizar e reenviar os
                  documentos necessários.
                </Text>
              </View>
            </View>
          </View>

          {/* Botões refatorados */}
          <View className="px-6 pb-6 pt-4">
            <View className="gap-3">
              {/* Botão principal - Reenviar Documentos */}
              <TouchableOpacity
                onPress={() => setDocumentsModalVisible(true)}
                className="rounded-xl py-4 px-6"
                style={{ backgroundColor: Colors.primaryColor }}
              >
                <View className="flex-row items-center justify-center gap-3">
                  <Ionicons name="cloud-upload" size={20} color="white" />
                  <Text className=" text-white font-semibold text-base">
                    Reenviar Documentos
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Botão secundário - Sair */}
              <TouchableOpacity
                onPress={() => {
                  logout();
                  router.replace("/login");
                }}
                className="bg-gray-100 border border-gray-300 rounded-xl py-4 px-6 active:bg-gray-200"
              >
                <View className="flex-row items-center justify-center gap-3">
                  <Ionicons name="log-out-outline" size={20} color="#6b7280" />
                  <Text className="text-gray-600 font-semibold text-base">
                    Sair
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* DrawerMenu */}
        <DrawerMenu
          isVisible={isDrawerVisible}
          onClose={handleCloseDrawer}
          showOnlyLogout={true}
        />

        {/* Modal de Documentos */}
        <Modal visible={documentsModalVisible} animationType="slide">
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
              {/* Header do Modal */}
              <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
                <Text className="text-xl font-bold">Reenviar Documentos</Text>
                <TouchableOpacity
                  onPress={() => setDocumentsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Conteúdo do Modal */}
              <ScrollView
                className="flex-1 p-5"
                contentContainerStyle={{ paddingBottom: 150 }}
              >
                <View className="mb-6">
                  <Text className="text-lg font-semibold mb-2 text-gray-800">
                    Documentos com Divergências
                  </Text>
                  <Text className="text-gray-600 mb-4">
                    Selecione os arquivos corretos para cada documento
                    solicitado:
                  </Text>
                </View>

                {/* Lista de documentos */}
                <View className="gap-4">{renderDocumentRequests()}</View>
              </ScrollView>

              {/* Botões do Modal */}
              <View className="p-5 border-t border-gray-200 bg-white">
                <View className="gap-3">
                
                <TouchableOpacity
                  onPress={() => {
                      setDocumentsModalVisible(false);
                      handleSubmitDocuments();
                    }}
                    disabled={
                      !areAllDocumentsSelected() || isLoading
                    }
                  className="rounded-xl py-4 px-6"
                  style={{ backgroundColor: areAllDocumentsSelected() && !isLoading 
                        ? Colors.primaryColor
                        : "#d1d5db" }}
                >
                   <View className="flex-row items-center justify-center gap-3">
                      {isLoading ? (
                        <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={
                            areAllDocumentsSelected()
                              ? "white"
                              : "#9ca3af"
                          }
                        />
                      )}
                      <Text
                        className={`font-semibold text-base ${
                          areAllDocumentsSelected() && !isLoading
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      >
                        {isLoading
                          ? "Enviando..."
                          : `Enviar ${areAllDocumentsSelected() ? `(${Object.keys(selectedFiles).length})` : `(${Object.keys(selectedFiles).length}/${divergenciasArray.length})`}`}
                      </Text>
                    </View>
                </TouchableOpacity>



                  {/* Botão Cancelar */}
                  <TouchableOpacity
                    onPress={() => setDocumentsModalVisible(false)}
                    className="bg-gray-100 border border-gray-300 rounded-xl py-4 px-6 active:bg-gray-200"
                  >
                    <View className="flex-row items-center justify-center gap-3">
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color="#6b7280"
                      />
                      <Text className="text-gray-600 font-semibold text-base">
                        Cancelar
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
}
