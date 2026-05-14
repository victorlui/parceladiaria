import { useRegisterStore } from "@/store/register_new";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getInitialSelectedForItem, safeParseArray } from "./utils/parse";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useAlerts } from "@/components/useAlert";
import ItemDivergente from "./components/ItemDivergente";
import SendDocument, { type Selected } from "./components/SendDocument";
import { uploadDocumentService } from "./service/upload";
import PulsingImageLoader from "../register/components/PulsingImageLoader";
import FaceCaptureWebView from "../face/components/FaceCaptureWebView";
import { updateUserService } from "@/services/register";
import { Etapas } from "@/utils";
import { router } from "expo-router";

const DivergenciaScreen: React.FC = () => {
  const { AlertDisplay, showError, showSuccess, showWarning } = useAlerts();
  const { data, clean } = useRegisterStore();
  const divergencias = safeParseArray(data?.divergencias || "[]");
  const [item, setItem] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, { key: string; selected?: Selected }>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const onSelect = (item: any) => {
    setItem(item);
  };

  const isAllSelected =
    Object.keys(selectedFiles).length === divergencias.length;

  const uploadDocument = async (selected: Selected | null) => {
    if (!selected || !item) return;

    setLoading(true);
    try {
      const url = await uploadDocumentService(selected);
      const selectedForPreview: Selected = { ...selected, uri: url };

      setSelectedFiles((prev) => ({
        ...prev,
        [item]: { key: url, selected: selectedForPreview },
      }));
      setItem("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    if (divergencias.length === 0) {
      showWarning("Atenção", "Nenhum documento divergente foi encontrado.");
      return;
    }

    if (!isAllSelected) {
      showWarning(
        "Atenção",
        "Envie todos os documentos divergentes antes de continuar.",
      );
      return;
    }

    setLoadingSubmit(true);
    try {
      for (const [key, file] of Object.entries(selectedFiles)) {
        const uploadedUrl = file.key;
        if (!uploadedUrl) {
          continue;
        }

        const mappedKey = key === "ganhos_app" ? "video_perfil_app" : key;

        await updateUserService({
          request: { [mappedKey]: uploadedUrl },
        });
      }

      await updateUserService({ request: { etapa: Etapas.FINALIZADO } });
      showSuccess(
        "Sucesso",
        "Documentos enviados com sucesso para reanálise.",
        () => {
          clean();
          router.replace("/login");
        },
      );
    } catch (error: any) {
      showError(
        "Erro",
        error?.message ||
          "Não foi possível enviar os documentos. Tente novamente.",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text="Enviando arquivo..."
      />
    );
  }

  if (loadingSubmit) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text="Enviando documentos..."
      />
    );
  }

  if (item && item !== "face") {
    return (
      <SendDocument
        item={item}
        initialSelected={getInitialSelectedForItem(item, selectedFiles)}
        back={() => setItem("")}
        onSubmit={uploadDocument}
      />
    );
  }

  if (item && item === "face") {
    return (
      <FaceCaptureWebView
        visible
        onSuccess={(file: any) => uploadDocument(file.file)}
        onClose={() => setItem("")}
      />
    );
  }

  const renderDocumentRequests = () => {
    return divergencias.map((documentKey: string, index: number) => {
      return (
        <ItemDivergente
          key={index}
          item={documentKey}
          selectedUri={selectedFiles[documentKey]?.key}
          onSelect={onSelect}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AlertDisplay />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Documentos Divergentes</Text>
        <Text style={styles.subtitle}>
          Alguns documentos precisam ser reenviados para concluir a validação.
          Verifique os itens abaixo e envie novamente.
        </Text>

        <View>
          <Text style={styles.observacoesTitle}>Observações</Text>
          <Text style={styles.observacoesText}>{data?.observacoes}</Text>
        </View>

        <View style={styles.itemsContainer}>{renderDocumentRequests()}</View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!isAllSelected || loadingSubmit || loading}
          style={[
            styles.submitButton,
            (!isAllSelected || loadingSubmit || loading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={() => onSubmit()}
        >
          <Text
            style={[
              styles.textButton,
              (!isAllSelected || loadingSubmit || loading) &&
                styles.textButtonDisabled,
            ]}
          >
            Enviar tudo e continuar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  observacoesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#11181C",
  },
  observacoesText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginVertical: 12,
  },
  itemsContainer: {
    gap: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
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
