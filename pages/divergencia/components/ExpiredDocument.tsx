import { AnalyticsService } from "@/analytics/analytics.service";
import { trackAppError } from "@/analytics/error-handler";
import {
  ANALYTICS_FLOWS,
  DIVERGENCIA_ANALYTICS_SOURCES,
  DIVERGENCIA_SCREENS,
  EVENTS,
} from "@/analytics/events";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import FaceCaptureWebView from "@/pages/face/components/FaceCaptureWebView";
import PulsingImageLoader from "@/pages/register/components/PulsingImageLoader";
import { updateUserService } from "@/services/register";
import { useRegisterStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadDocumentService } from "../service/upload";

export default function ExpiredDocument() {
  const { AlertDisplay, showError, showSuccess, showWarning } = useAlerts();
  const { data, clean } = useRegisterStore();
  const { takeVideo } = useDocumentPicker(10);

  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name?: string;
    mimeType?: string;
  } | null>(null);
  const [isFaceOpen, setIsFaceOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    AnalyticsService.screen(DIVERGENCIA_SCREENS.EXPIRED_DOCUMENT, {
      flow: ANALYTICS_FLOWS.DIVERGENCIA,
    });
  }, []);

  const normalizedProfissao = useMemo(
    () =>
      String(data?.profissao || "")
        .trim()
        .toLowerCase(),
    [data?.profissao],
  );

  const isComerciante = useMemo(
    () => normalizedProfissao.includes("comerc"),
    [normalizedProfissao],
  );

  const isMotorista = useMemo(
    () =>
      normalizedProfissao.includes("motor") ||
      normalizedProfissao.includes("motob"),
    [normalizedProfissao],
  );

  const actionTitle = isComerciante
    ? "Comerciante: faça o reconhecimento facial"
    : isMotorista
      ? "Motorista: envie seu relatório de ganhos"
      : "Envie a informação solicitada";

  const requirementLabel = isComerciante
    ? "Reconhecimento Facial"
    : "Relatório de Ganhos";

  const selectButtonLabel = isComerciante
    ? "Fazer reconhecimento facial"
    : "Selecionar vídeo de ganhos";

  const updateKey = isComerciante ? "face" : "video_perfil_app";

  const onPickVideo = () => {
    Alert.alert("Relatório de ganhos", "Como você deseja enviar o vídeo?", [
      {
        text: "Gravar agora",
        onPress: async () => {
          const file = await takeVideo("camera");
          if (!file) return;
          setSelectedFile({
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
          });
        },
      },
      {
        text: "Escolher da galeria",
        onPress: async () => {
          const file = await takeVideo("library");
          if (!file) return;
          setSelectedFile({
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
          });
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const onSelect = async () => {
    if (isComerciante) {
      setIsFaceOpen(true);
      return;
    }

    onPickVideo();
  };

  const onSubmit = async () => {
    if (!selectedFile?.uri) {
      showWarning("Atenção", "Selecione o arquivo antes de continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = await uploadDocumentService(selectedFile);
      await updateUserService({
        request: { [updateKey]: url, etapa: Etapas.FINALIZADO },
        analyticsContext: {
          flow: ANALYTICS_FLOWS.DIVERGENCIA,
          source: DIVERGENCIA_ANALYTICS_SOURCES.EXPIRED_DOCUMENT_SUBMIT,
        },
      });

      AnalyticsService.track(EVENTS.DOCUMENT_SENT, {
        flow: ANALYTICS_FLOWS.DIVERGENCIA,
        source: DIVERGENCIA_ANALYTICS_SOURCES.EXPIRED_DOCUMENT_SUBMIT,
        update_key: updateKey,
      });

      showSuccess(
        "Sucesso",
        "Arquivo enviado com sucesso para nova análise.",
        () => {
          clean();
          router.replace("/login");
        },
      );
    } catch (error: any) {
      trackAppError(error, {
        flow: ANALYTICS_FLOWS.DIVERGENCIA,
        source: DIVERGENCIA_ANALYTICS_SOURCES.EXPIRED_DOCUMENT_SUBMIT,
        update_key: updateKey,
      });
      showError(
        "Erro",
        error?.message || "Não foi possível enviar o arquivo. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onExit = () => {
    clean();
    router.replace("/login");
  };

  if (isSubmitting) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text="Enviando arquivo..."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AlertDisplay />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>PROPOSTA EXPIRADA</Text>
            </View>

            <View style={styles.iconCircle}>
              <FontAwesome5 name="hourglass-half" size={26} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Sua pré-aprovação expirou</Text>
            <Text style={styles.subtitle}>
              Pra retomar, a gente só precisa atualizar uma informação:
            </Text>

            <View style={styles.highlightRow}>
              <Ionicons
                name="card-outline"
                size={18}
                color={Colors.green.button}
              />
              <Text style={styles.highlightText}>{actionTitle}</Text>
            </View>

            <Text style={styles.helperText}>
              Depois disso, sua proposta passa por uma nova análise. A aprovação
              anterior não é garantida — pode mudar conforme seu perfil atual.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O QUE ENVIAR</Text>
            <Text style={styles.sectionSubtitle}>{requirementLabel}</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.selectButton}
              onPress={onSelect}
            >
              <View style={styles.selectIconCircle}>
                <Ionicons
                  name={isComerciante ? "camera" : "videocam"}
                  size={20}
                  color={Colors.green.button}
                />
              </View>
              <Text style={styles.selectButtonText}>{selectButtonLabel}</Text>
            </TouchableOpacity>

            {selectedFile?.uri ? (
              <View style={styles.selectedRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.green.button}
                />
                <Text style={styles.selectedText}>
                  Arquivo selecionado
                  {selectedFile.name ? `: ${selectedFile.name}` : ""}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.primaryButton,
                !selectedFile?.uri && styles.primaryButtonDisabled,
              ]}
              disabled={!selectedFile?.uri}
              onPress={onSubmit}
            >
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>
                Enviar para nova análise
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.secondaryButton}
              onPress={onExit}
            >
              <Text style={styles.secondaryButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <FaceCaptureWebView
        visible={isFaceOpen}
        onClose={() => setIsFaceOpen(false)}
        onSuccess={(payload: any) => {
          const file = payload?.file;
          if (!file?.uri) {
            showError(
              "Erro",
              "Não foi possível obter a captura. Tente novamente.",
            );
            setIsFaceOpen(false);
            return;
          }
          setSelectedFile({
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
          });
          setIsFaceOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 18,
  },
  content: {
    flex: 1,
    justifyContent: "space-evenly",
  },
  card: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EEF0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pill: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E6F4F1",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: Colors.green.button,
  },
  iconCircle: {
    alignSelf: "center",
    marginTop: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.green.button,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.green.button,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  highlightRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.green.button,
    textAlign: "center",
  },
  helperText: {
    marginTop: 10,
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EEF0",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  selectButton: {
    marginTop: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CFE7E3",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F7FFFD",
  },
  selectIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E6F4F1",
    justifyContent: "center",
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.green.button,
  },
  selectedRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
  primaryButton: {
    marginTop: 18,
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.green.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#fff",
  },
  secondaryButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
});
