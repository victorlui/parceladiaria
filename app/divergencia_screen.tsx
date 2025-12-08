import ItemsDivergentes, {
  documentDisplayNames,
} from "@/components/divergente/items-divergentes";
import LoadingDots from "@/components/ui/LoadingDots";
import StatusBar from "@/components/ui/StatusBar";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { updateUserService } from "@/services/register";
import { useAuthStore } from "@/store/auth";
import { Etapas } from "@/utils";
import { AntDesign, Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DivergenciaScreen: React.FC = () => {
  useDisableBackHandler();
  const { userRegister, logout } = useAuthStore();
  const { AlertDisplay, showWarning } = useAlerts();
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

  const isAllSelected =
    Object.keys(selectedFiles).length === divergenciasArray.length;

  const handleBack = () => {
    Alert.alert("Sair", "Deseja sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const onSubmit = async () => {
    if (!isAllSelected) {
      return;
    }

    console.log("selectedFiles", Object.entries(selectedFiles));
    setIsLoading(true);
    try {
      // Atualiza etapa para FINALIZADO antes de começar os uploads

      // Para cada arquivo, faz upload e já envia a URL individualmente
      for (const [key, item] of Object.entries(selectedFiles)) {
        // Detecta se é vídeo (.mp4) ou imagem
        const isVideo = item.uri.toLowerCase().endsWith(".mp4");
        const mimeType = isVideo ? "video/mp4" : "image/jpeg";
        const extension = isVideo ? "mp4" : "jpg";

        // Gera nome único baseado no tipo de documento e timestamp
        const timestamp = Date.now();
        const fileName = `${key}_${timestamp}.${extension}`;

        const uploadedUrl = await uploadFileToS3({
          file: { uri: item.uri, name: fileName, mimeType },
        });

        // Substitui "ganhos_app" por "videos_perfil"
        const mappedKey = key === "ganhos_app" ? "video_perfil_app" : key;

        // Envia a URL do arquivo imediatamente após o upload
        const response = await updateUserService({
          request: { [mappedKey]: uploadedUrl },
        });

        console.log("response", response);
      }
      await updateUserService({ request: { etapa: Etapas.FINALIZADO } });
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
    } catch (error: any) {
      console.log("error aqui", error);
      if (
        error.data?.message &&
        error.data?.message ===
          "Não foi possivel identificar um documento valido."
      ) {
        showWarning("Atenção", "Por favor, envie um documento válido.");
        return;
      }

      showWarning("Erro", error.data?.message || "Ocorreu um erro.");
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
          selectedUri={
            item === "face"
              ? selectedFiles[item]?.uri
              : selectedFiles[item]?.nameImage
          }
          onSelect={(documentType, uri, name) => {
            console.log("image", documentType, uri, name);
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

  const LoadingScreen: React.FC = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size={140} color={Colors.green.primary} />
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.spinnerLogo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.loadingText}>
        Enviando documentos, favor aguarde...
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AlertDisplay />

      {isLoading && <LoadingScreen />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Documentos Divergentes</Text>
        <Text style={styles.subtitle}>
          Alguns documentos precisam ser reenviados para concluir a validação.
          Verifique os itens abaixo e envie novamente.
        </Text>

        <View style={styles.itemsContainer}>{renderDocumentRequests()}</View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={isLoading || !isAllSelected}
          style={[
            styles.submitButton,
            !isAllSelected && styles.submitButtonDisabled,
          ]}
          onPress={() => onSubmit()}
        >
          {isLoading ? (
            <LoadingDots text="Enviando" />
          ) : (
            <>
              {!isAllSelected && (
                <Ionicons
                  name="lock-closed"
                  size={18}
                  color={Colors.gray.text}
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                style={[
                  styles.textButton,
                  !isAllSelected && styles.textButtonDisabled,
                ]}
              >
                Enviar tudo e continuar
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#11181C",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#11181C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  itemsContainer: {
    gap: 12,
  },
  footer: {},
  submitButton: {
    backgroundColor: Colors.green.button,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  textButton: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  textButtonDisabled: {
    color: "#9CA3AF",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinnerLogo: {
    position: "absolute",
    width: 80,
    height: 80,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.green.primary,
  },
});

export default DivergenciaScreen;
