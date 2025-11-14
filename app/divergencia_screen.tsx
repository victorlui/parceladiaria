import ItemsDivergentes, {
  documentDisplayNames,
} from "@/components/divergente/items-divergentes";
import LoadingDots from "@/components/ui/LoadingDots";
import StatusBar from "@/components/ui/StatusBar";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { updateUserService } from "@/services/register";
import { useAuthStore } from "@/store/auth";
import { Etapas } from "@/utils";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DivergenciaScreen: React.FC = () => {
  const { userRegister, logout } = useAuthStore();
  const { AlertDisplay, showWarning, showSuccess } = useAlerts();
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, { uri: string; nameImage: string }>
  >({});
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

  const divergenciasArray = safeParseArray(userRegister?.divergencias);

  const observacoesPorDocumento: Record<string, string> = {
    comprovante_endereco:
      "Envie um comprovante recente de endereço com seu nome.",
    foto_perfil_app:
      "Perfil completo no app de corridas com: quantidade de corridas, tempo de uso e foto de perfil atualizada e visível.",
    foto_perfil_app2:
      "Perfil completo em outro app de corridas com: quantidade de corridas, tempo de uso e foto de perfil atualizada e visível.",
    foto_docveiculo:
      "Envie foto ou PDF do CRLV atualizado (exercício 2024/2025).",
    foto_veiculo:
      "Selfie ao lado do veículo mostrando claramente a placa e seu rosto.",
    video_comercio: "Envie um vídeo curto mostrando o comércio.",
    ganhos_app: "Envie vídeo do relatório de ganhos no app de corridas.",
    foto_frente_doc: "Foto da frente do documento legível.",
    foto_verso_doc: "Foto do verso do documento legível.",
    fachada: "Foto da fachada do comércio.",
    mei: "Certificado de MEI.",
    face: "Reconhecimento facial.",
  };

  const getObservacaoText = (key: string) =>
    observacoesPorDocumento[key] ||
    `Envie o arquivo solicitado: ${documentDisplayNames[key] || key}.`;

  console.log("divergenciasArray", divergenciasArray);

  const onSubmit = async () => {
    if (Object.keys(selectedFiles).length !== divergenciasArray.length) {
      showWarning(
        "Atenção",
        "Por favor, envie todos os documentos solicitados."
      );
      return;
    }

    console.log("selectedFiles", Object.entries(selectedFiles));
    setIsLoading(true);
    try {
      const uploadedFiles: Record<string, string> = {};
      for (const [key, item] of Object.entries(selectedFiles)) {
        // Gera nome único baseado no tipo de documento e timestamp
        const timestamp = Date.now();
        const fileName = `${key}_${timestamp}.jpg`;

        const uploadedUrl = await uploadFileToS3({
          file: { uri: item.uri, name: fileName, mimeType: "image/jpeg" },
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
        }`,
        [
          {
            text: "OK",
            onPress: () => {
              logout();
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDocumentRequests = () => {
    return divergenciasArray.map((item: string, index: number) => {
      return (
        <ItemsDivergentes
          key={index}
          item={item}
          selectedUri={selectedFiles[item]?.nameImage}
          onSelect={(documentType, uri, name) => {
            console.log("name", name);
            setSelectedFiles((prev) => ({
              ...prev,
              [documentType]: { uri, nameImage: name },
            }));
          }}
        />
      );
    });
  };

  // Componente para animar os pontinhos de carregamento

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <StatusBar />
      <AlertDisplay />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          backgroundColor: Colors.white,
        }}
      >
        <View style={styles.card}>
          <Entypo name="warning" size={50} color="#EA580C" />
          <Text style={styles.title}>Documentos Divergentes</Text>
          <View style={styles.observacoes}>
            <Text style={[styles.title, { fontSize: 16 }]}>Observações:</Text>
            <View style={{ marginTop: 8 }}>
              {divergenciasArray.length > 0 ? (
                <View>
                  {divergenciasArray.map((key: string, idx: number) => (
                    <View key={idx} style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, color: "#000" }}>
                        {"\u2022"} {documentDisplayNames[key] || key}
                      </Text>
                      <Text style={{ fontSize: 14, color: "#000" }}>
                        {getObservacaoText(key)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ fontSize: 14, color: "#000" }}>
                  {"\u2022"} Perfil Completo{"\n"}O perfil deve conter as
                  seguintes informações:{"\n"}
                  {"  "}° Quantidade de corridas realizadas{"\n"}
                  {"  "}° Tempo de uso no aplicativo{"\n"}
                  {"  "}° Foto de perfil atualizada e visível{"\n"}
                  {"\n"}
                  {"\u2022"} Selfie ao Lado do Veículo{"\n"}
                  Tire uma selfie sua ao lado do veículo, mostrando de forma
                  clara e legível a placa e o seu rosto.{"\n"}
                  {"\n"}
                  {"\u2022"} CRLV Atualizado{"\n"}
                  Envie uma foto ou PDF do CRLV atualizado (exercício
                  2024/2025).
                  {"\n"}
                  {"\n"}
                  {"\u2022"} CNH Atualizada{"\n"}
                  Envie foto ou PDF (frente e verso) da CNH atualizada, com
                  todos os dados legíveis.{"\n"}
                  Retire a CNH do plástico para a foto.
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.sendDocuments}>
          <Text style={styles.textDocuments}>
            Por favor, envie os documentos solicitados abaixo para uma nova
            análise.
          </Text>

          <View style={styles.itemsContainer}>
            {renderDocumentRequests()}

            <TouchableOpacity
              disabled={isLoading}
              style={styles.button}
              onPress={() => onSubmit()}
            >
              {isLoading ? (
                <LoadingDots text="Enviando" />
              ) : (
                <>
                  <FontAwesome name="send" size={20} color="white" />
                  <Text style={styles.textButton}>Enviar para Reanálise</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonSair}
              disabled={isLoading}
              onPress={() => {
                logout();
                router.replace("/login");
              }}
            >
              <Text style={styles.textButtonSair}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  observacoes: {
    width: "100%",
  },
  sendDocuments: {
    gap: 20,
    marginVertical: 20,
  },
  itemsContainer: {
    gap: 20,
  },
  textDocuments: {
    color: Colors.gray.text,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 23,
  },
  button: {
    backgroundColor: Colors.green.button,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textButton: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSair: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textButtonSair: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DivergenciaScreen;
