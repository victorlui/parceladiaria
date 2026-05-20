import ButtonChat from "@/components/ui/ButtonChat";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { updateUserService } from "@/services/register";
import { useRegisterStore } from "@/store/register_new";
import { Etapas, StatusCadastro } from "@/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import FaceCaptureWebView from "../face/components/FaceCaptureWebView";
import PulsingImageLoader from "../register/components/PulsingImageLoader";
import ExpiredDocument from "./components/ExpiredDocument";
import ItemDivergente from "./components/ItemDivergente";
import SendDocument, { type Selected } from "./components/SendDocument";
import Openfinance from "./Openfinance";
import { uploadDocumentService } from "./service/upload";
import { getInitialSelectedForItem, safeParseArray } from "./utils/parse";

const DivergenciaScreen: React.FC = () => {
  const { AlertDisplay, showError, showSuccess, showWarning } = useAlerts();
  const { data, clean } = useRegisterStore();
  const divergencias = safeParseArray(data?.divergencias || "[]")
    .map((value: any) => {
      if (typeof value === "string") return value;
      if (typeof value?.key === "string") return value.key;
      if (typeof value?.item === "string") return value.item;
      return "";
    })
    .filter((value: string) => Boolean(value));
  const isPrimeiraAnalise = Number(data?.primeira_analise) === 1;
  const [item, setItem] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, { key: string; selected?: Selected }>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

  const isMountedRef = useRef(true);
  const isUploadingRef = useRef(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onSelect = (nextItem: any) => {
    const next =
      typeof nextItem === "string" ? nextItem : String(nextItem ?? "");
    setItem(next);
  };

  const totalDocumentos = divergencias.length;
  const enviados = divergencias.filter((documentKey: string) => {
    if (documentKey === "openfinance") {
      return selectedFiles.openfinance?.key === "connected";
    }
    return Boolean(selectedFiles[documentKey]?.key);
  }).length;

  const isAllSelected = divergencias.length > 0 && enviados === totalDocumentos;

  const checkProgress = 0.75;
  const checkRingSize = 64;
  const checkRingStrokeWidth = 6;
  const checkRingRadius = (checkRingSize - checkRingStrokeWidth) / 2;
  const checkRingCircumference = 2 * Math.PI * checkRingRadius;
  const checkRingDashoffset =
    checkRingCircumference * (1 - Math.max(0, Math.min(1, checkProgress)));

  const normalizeSelected = (value: any): Selected | null => {
    const rawUri = typeof value?.uri === "string" ? value.uri : "";
    if (!rawUri) return null;

    const uri = rawUri.trim();
    if (!uri) return null;

    const nameFromUri =
      uri.split("?")[0].split("#")[0].split("/").pop()?.trim() || "arquivo";
    const name =
      typeof value?.name === "string" && value.name.trim()
        ? value.name.trim()
        : nameFromUri;

    const rawMimeType =
      typeof value?.mimeType === "string" ? value.mimeType.trim() : "";
    const mimeType =
      rawMimeType ||
      (name.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : name.toLowerCase().endsWith(".mp4") ||
            name.toLowerCase().endsWith(".mov") ||
            name.toLowerCase().endsWith(".m4v")
          ? "video/mp4"
          : "image/jpeg");

    const type: Selected["type"] =
      value?.type === "pdf" ||
      value?.type === "image" ||
      value?.type === "video"
        ? value.type
        : mimeType.includes("pdf")
          ? "pdf"
          : mimeType.startsWith("video/")
            ? "video"
            : "image";

    return { uri, name, mimeType, type };
  };

  const extractFaceSelected = (payload: any): Selected | null => {
    const candidate = payload?.file?.uri
      ? payload.file
      : payload?.file?.file?.uri
        ? payload.file.file
        : payload?.data?.file?.uri
          ? payload.data.file
          : payload?.data?.file?.file?.uri
            ? payload.data.file.file
            : null;

    if (!candidate) return null;

    const selected = normalizeSelected({
      uri: candidate.uri,
      name: candidate.name || `face_${Date.now()}.jpg`,
      mimeType: candidate.mimeType || "image/jpeg",
      type: "image",
    });
    return selected;
  };

  const uploadDocument = async (
    selected: Selected | null,
    documentKey?: string,
  ) => {
    const currentItem =
      typeof (documentKey ?? item) === "string"
        ? (documentKey ?? item)
        : String(documentKey ?? item ?? "");
    const normalized = normalizeSelected(selected);

    if (!normalized || !currentItem) {
      showWarning("Atenção", "Selecione um arquivo válido antes de continuar.");
      return;
    }

    if (isUploadingRef.current) return;
    isUploadingRef.current = true;

    setLoading(true);
    try {
      const url = await uploadDocumentService(normalized);
      if (!url || typeof url !== "string") {
        throw new Error("Não foi possível enviar o arquivo.");
      }

      await updateUserService({
        request: { [currentItem]: url },
      });

      if (!isMountedRef.current) return;
      setSelectedFiles((prev) => ({
        ...prev,
        [currentItem]: { key: url, selected: normalized },
      }));
      setItem("");
    } catch (error: any) {
      showError(
        "Erro",
        error?.message ||
          "Não foi possível enviar os documentos. Tente novamente.",
      );
    } finally {
      isUploadingRef.current = false;
      if (isMountedRef.current) setLoading(false);
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

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoadingSubmit(true);
    try {
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
      isSubmittingRef.current = false;
      if (isMountedRef.current) setLoadingSubmit(false);
    }
  };

  if (loading) {
    return (
      <>
        <AlertDisplay />
        <PulsingImageLoader
          source={require("@/assets/images/logo-verde.png")}
          text="Enviando arquivo..."
        />
      </>
    );
  }

  if (loadingSubmit) {
    return (
      <>
        <AlertDisplay />
        <PulsingImageLoader
          source={require("@/assets/images/logo-verde.png")}
          text="Enviando documentos..."
        />
      </>
    );
  }

  if (item && item === "openfinance") {
    return (
      <>
        <AlertDisplay />
        <Openfinance
          back={() => setItem("")}
          onConnected={() => {
            setSelectedFiles((prev) => ({
              ...prev,
              openfinance: { key: "connected" },
            }));
            showSuccess("Sucesso", "Open Finance conectado com sucesso.");
          }}
        />
      </>
    );
  }

  if (item && item !== "face" && item !== "openfinance") {
    return (
      <>
        <AlertDisplay />
        <SendDocument
          item={item}
          initialSelected={getInitialSelectedForItem(item, selectedFiles)}
          back={() => setItem("")}
          onSubmit={uploadDocument}
        />
      </>
    );
  }

  if (item && item === "face") {
    return (
      <>
        <AlertDisplay />
        <FaceCaptureWebView
          visible
          onSuccess={(payload: any) => {
            setItem("");
            const faceSelected = extractFaceSelected(payload);
            if (!faceSelected) {
              showError(
                "Erro",
                "Não foi possível obter a captura. Tente novamente.",
              );
              return;
            }
            uploadDocument(faceSelected, "face");
          }}
          onClose={() => setItem("")}
        />
      </>
    );
  }

  if (data?.status === StatusCadastro.PROPOSTA_EXPIRADO) {
    return <ExpiredDocument />;
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
        {!isPrimeiraAnalise ? (
          <>
            <Text style={styles.title}>Documentos Divergentes</Text>
            <Text style={styles.subtitle}>
              Alguns documentos precisam ser reenviados para concluir a
              validação. Verifique os itens abaixo e envie novamente.
            </Text>

            <View>
              <Text style={styles.observacoesTitle}>Observações</Text>
              <Text style={styles.observacoesText}>{data?.observacoes}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.headerCard}>
              <View style={styles.headerPill}>
                <Text style={styles.headerPillText}>
                  ETAPA 2 DE 2 · ÚLTIMA ETAPA
                </Text>
              </View>

              <View style={styles.headerIconCircle}>
                <Svg
                  width={checkRingSize}
                  height={checkRingSize}
                  style={styles.headerIconRing}
                >
                  <Circle
                    cx={checkRingSize / 2}
                    cy={checkRingSize / 2}
                    r={checkRingRadius}
                    stroke="#E6F4F1"
                    strokeWidth={checkRingStrokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={checkRingSize / 2}
                    cy={checkRingSize / 2}
                    r={checkRingRadius}
                    stroke={Colors.green.primary}
                    strokeWidth={checkRingStrokeWidth}
                    strokeDasharray={`${checkRingCircumference} ${checkRingCircumference}`}
                    strokeDashoffset={checkRingDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(-90 ${checkRingSize / 2} ${checkRingSize / 2})`}
                  />
                </Svg>
                <FontAwesome5
                  name="check"
                  size={26}
                  color={Colors.green.primary}
                />
              </View>

              <Text style={styles.headerTitle}>
                Falta pouco pra concluir seu cadastro
              </Text>

              <Text style={styles.headerLabel}>O que falta:</Text>

              <View style={styles.headerBox}>
                <Text style={styles.headerBoxText}>
                  Envie os documentos abaixo pra concluir seu cadastro.{" "}
                  <Text style={styles.headerBoxTextBold}>
                    O envio leva menos de 5 minutos.
                  </Text>
                </Text>
              </View>
            </View>

            <Text style={styles.headerHint}>
              Preencha os dados e envie os documentos solicitados abaixo
            </Text>

            {!isPrimeiraAnalise && (
              <View style={styles.observacoesContainer}>
                <Text style={styles.observacoesTitle}>Observações</Text>
                <Text style={styles.observacoesText}>{data?.observacoes}</Text>
              </View>
            )}
          </>
        )}

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
            {isPrimeiraAnalise ? "Concluir cadastro" : "Enviar novamente"}
          </Text>
        </TouchableOpacity>
      </View>
      <ButtonChat />
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
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  headerPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E6F4F1",
    marginBottom: 14,
  },
  headerPillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#0F766E",
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: Colors.white,
  },
  headerIconRing: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#11181C",
    textAlign: "center",
    marginBottom: 14,
  },
  headerLabel: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "700",
    color: "#11181C",
    marginBottom: 8,
  },
  headerBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0F766E",
    borderRadius: 12,
    padding: 14,
  },
  headerBoxText: {
    fontSize: 14,
    color: "#11181C",
    lineHeight: 20,
  },
  headerBoxTextBold: {
    fontWeight: "800",
    color: "#11181C",
  },
  headerHint: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  observacoesContainer: {
    marginTop: 4,
    marginBottom: 16,
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
