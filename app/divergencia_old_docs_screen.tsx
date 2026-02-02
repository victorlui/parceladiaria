import ItemsDivergentes, {
  documentDisplayNames,
} from "@/components/divergente/items-divergentes";
import LoadingDots from "@/components/ui/LoadingDots";
import StatusBar from "@/components/ui/StatusBar";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { uploadFileToS3, uploadRawFile } from "@/hooks/useUploadDocument";
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
  const { logout } = useAuthStore();
  const { AlertDisplay, showWarning } = useAlerts();
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, { uri: string; nameImage: string }>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const divergenciasArray = ["foto_frente_doc", "foto_verso_doc", "face"];

  const isAllSelected =
    Object.keys(selectedFiles).length === divergenciasArray.length;

  const onSubmit = async () => {
    if (!isAllSelected) {
      return;
    }

    setIsLoading(true);
    try {
      for (const [key, item] of Object.entries(selectedFiles)) {
        const mimeType = "image/jpeg";
        const extension = "jpg";
        // Gera nome único baseado no tipo de documento e timestamp
        const timestamp = Date.now();
        const fileName = `${key}_${timestamp}.${extension}`;

        const file = {
          uri: item.uri,
          name: fileName,
          type: mimeType,
        };

        const finalUrl = await uploadRawFile(file);
        console.log("finalUrl", finalUrl);
        // Envia a URL do arquivo imediatamente após o upload
        const response = await updateUserService({
          request: { [key]: finalUrl },
        });

        console.log("response", response);
      }

      await updateUserService({ request: { etapa: Etapas.FINALIZADO } });
      Alert.alert(
        "Sucesso",
        "Os documentos foram enviados com sucesso para reanalise",
        [
          {
            text: "OK",
            onPress: () => {
              logout();
              router.replace("/login");
            },
          },
        ],
      );
    } catch (error) {
      showWarning("Atenção", "Erro ao enviar documentos. Tente novamente.");
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
              {isAllSelected && (
                <FontAwesome name="send" size={20} color="white" />
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
    gap: 8,
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
