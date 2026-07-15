import ButtonComponent from "@/components/ui/Button";
import { useVideoGanhosStatus } from "@/pages/divergencia/hook/useVideoGanhosStatus";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoGanhosChecklist from "./VideoGanhosChecklist";

type Props = {
  onContinue: () => void | Promise<void>;
  onFeatureDisabled: () => void | Promise<void>;
  onRetryVideo: (
    action: "enviar_video_complementar" | "reenviar_video",
  ) => void;
};

function resolveHeader(result: string | null, isProcessing: boolean) {
  if (isProcessing) {
    return {
      title: "Analisando seu vídeo",
      description:
        "Estamos validando as informações do vídeo. Isso pode levar alguns instantes.",
      accentColor: "#166534",
      accentBackground: "#DCFCE7",
      icon: "hourglass-outline" as const,
    };
  }

  switch (result) {
    case "aprovado":
      return {
        title: "Vídeo aprovado",
        description:
          "Seu vídeo atendeu aos critérios e a análise segue normalmente.",
        accentColor: "#166534",
        accentBackground: "#DCFCE7",
        icon: "checkmark-circle-outline" as const,
      };
    case "aceito_envie_complementar":
      return {
        title: "Envie um vídeo complementar",
        description:
          "Seu vídeo foi aceito. Agora envie outro vídeo de um aplicativo diferente.",
        accentColor: "#1D4ED8",
        accentBackground: "#DBEAFE",
        icon: "videocam-outline" as const,
      };
    case "reprovado":
      return {
        title: "Precisamos de um novo vídeo",
        description:
          "Alguns critérios não foram encontrados. Revise os itens abaixo antes de reenviar.",
        accentColor: "#B91C1C",
        accentBackground: "#FEE2E2",
        icon: "close-circle-outline" as const,
      };
    case "erro_leitura":
      return {
        title: "Não foi possível ler o vídeo",
        description:
          "Tivemos dificuldade para analisar o arquivo enviado. Reenvie um novo vídeo.",
        accentColor: "#B45309",
        accentBackground: "#FEF3C7",
        icon: "alert-circle-outline" as const,
      };
    case "video_repetido":
      return {
        title: "Envie um vídeo diferente",
        description:
          "Identificamos que este vídeo já foi enviado anteriormente. Envie outro vídeo de um aplicativo diferente.",
        accentColor: "#B91C1C",
        accentBackground: "#FEE2E2",
        icon: "copy-outline" as const,
      };
    case "em_analise":
      return {
        title: "Seu caso segue em análise",
        description:
          "Recebemos seu vídeo, mas o caso precisa de avaliação complementar.",
        accentColor: "#1F2937",
        accentBackground: "#E5E7EB",
        icon: "document-text-outline" as const,
      };
    default:
      return {
        title: "Acompanhamento do vídeo",
        description:
          "Consulte abaixo o status atual da validação do seu vídeo.",
        accentColor: "#166534",
        accentBackground: "#DCFCE7",
        icon: "information-circle-outline" as const,
      };
  }
}

export default function VideoGanhosStatus({
  onContinue,
  onFeatureDisabled,
  onRetryVideo,
}: Props) {
  const { width, height } = useWindowDimensions();
  const hasHandledFeatureOffRef = useRef(false);
  const [footerHeight, setFooterHeight] = useState(0);
  const { data, isLoading, isFetching, isError, refetch, hasTimedOut } =
    useVideoGanhosStatus({
      enabled: true,
    });

  useEffect(() => {
    if (
      !data ||
      data.feature_ativa !== false ||
      hasHandledFeatureOffRef.current
    ) {
      return;
    }

    hasHandledFeatureOffRef.current = true;
    void onFeatureDisabled();
  }, [data, onFeatureDisabled]);

  const isProcessing = data?.estado === "processando" && !hasTimedOut;
  const header = useMemo(
    () => resolveHeader(data?.resultado ?? null, isProcessing),
    [data?.resultado, isProcessing],
  );
  const horizontalPadding = width < 390 ? 18 : 24;
  const isCompactHeight = height;
  const titleSize = width < 390 ? 22 : 26;
  const bodySize = width < 390 ? 13 : 14;
  const sectionGap = isCompactHeight ? 12 : 16;
  const cardPadding = isCompactHeight ? 12 : 16;
  const footerBottomSpace = isCompactHeight ? 18 : 28;
  const currentMessage = hasTimedOut
    ? "A análise está demorando mais do que o esperado. Toque em Atualizar para consultar novamente."
    : data?.mensagem?.trim() ||
      "Assim que a análise terminar, você verá o resultado detalhado do vídeo.";

  const checklistData = data?.criterios;
  const hasAnyChecklistValue = Object.values(checklistData ?? {}).some(
    (value) => value !== null,
  );
  const shouldShowChecklist =
    Boolean(checklistData) &&
    hasAnyChecklistValue &&
    data?.feature_ativa !== false;
  const showContinueButton =
    data?.estado === "concluido" &&
    (data?.resultado === "aprovado" ||
      data?.resultado === "em_analise" ||
      data?.acao === "nenhuma");

  const actionButton = (() => {
    if (hasTimedOut || isError || data?.estado === "sem_envio") {
      return {
        label: "Atualizar",
        onPress: () => {
          void refetch();
        },
      };
    }

    if (data?.acao === "reenviar_video") {
      return {
        label: "Reenviar vídeo",
        onPress: () => onRetryVideo("reenviar_video"),
      };
    }

    if (data?.acao === "enviar_video_complementar") {
      return {
        label: "Enviar vídeo complementar",
        onPress: () => onRetryVideo("enviar_video_complementar"),
      };
    }

    if (showContinueButton) {
      return {
        label: "Continuar",
        onPress: () => {
          void onContinue();
        },
      };
    }

    return null;
  })();
  const reservedFooterSpace = actionButton
    ? footerHeight + footerBottomSpace + sectionGap
    : 66;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[
          styles.container,
          styles.contentContainer,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isCompactHeight ? 16 : 24,
            paddingBottom: footerBottomSpace,
            gap: sectionGap,
          },
        ]}
      >
        <View
          style={[
            styles.heroCard,
            {
              padding: horizontalPadding,
              backgroundColor: header.accentBackground,
            },
          ]}
        >
          <View style={styles.heroIcon}>
            {isLoading && !data ? (
              <ActivityIndicator size="small" color={header.accentColor} />
            ) : (
              <Ionicons
                name={header.icon}
                size={24}
                color={header.accentColor}
              />
            )}
          </View>

          <Text style={[styles.heroTitle, { fontSize: titleSize }]}>
            {header.title}
          </Text>
          <Text style={[styles.heroDescription, { fontSize: bodySize }]}>
            {header.description}
          </Text>
        </View>

        <View
          style={[
            styles.mainContent,
            {
              gap: sectionGap,
              paddingBottom: reservedFooterSpace,
            },
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status da análise</Text>
            <View style={[styles.messageCard, { padding: cardPadding }]}>
              <Text style={styles.messageText}>{currentMessage}</Text>
              {data?.tentativas ? (
                <Text style={styles.attemptText}>
                  Tentativa {data.tentativas.usadas} de {data.tentativas.max}
                </Text>
              ) : null}
              {isFetching && !isProcessing ? (
                <Text style={styles.refreshText}>Atualizando status...</Text>
              ) : null}
            </View>
          </View>

          {shouldShowChecklist && checklistData ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Checklist do vídeo</Text>
              <VideoGanhosChecklist criterios={checklistData} />
            </View>
          ) : null}

          {isProcessing ? (
            <View style={[styles.processingCard, { padding: cardPadding }]}>
              <ActivityIndicator size="large" color="#16A34A" />
              <Text style={styles.processingTitle}>Processando vídeo</Text>
              <Text style={styles.processingText}>
                Você pode aguardar nesta tela. O resultado aparece
                automaticamente.
              </Text>
            </View>
          ) : null}
        </View>

        {actionButton ? (
          <View
            onLayout={(event) => {
              const nextHeight = Math.ceil(event.nativeEvent.layout.height);
              if (nextHeight !== footerHeight) {
                setFooterHeight(nextHeight);
              }
            }}
            style={[
              styles.footer,
              {
                left: horizontalPadding,
                right: horizontalPadding,
                bottom: footerBottomSpace,
              },
            ]}
          >
            <ButtonComponent
              title={actionButton.label}
              onPress={actionButton.onPress}
              iconLeft={null}
              iconRight={
                actionButton.label === "Atualizar" ? "refresh" : "arrow-forward"
              }
              disabled={isFetching && actionButton.label === "Atualizar"}
            />
          </View>
        ) : (
          <View style={styles.footerSpacer} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    position: "relative",
  },
  contentContainer: {
    flex: 1,
  },
  heroCard: {
    borderRadius: 24,
    gap: 8,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  heroTitle: {
    fontWeight: "800",
    color: "#0F172A",
  },
  heroDescription: {
    lineHeight: 20,
    color: "#334155",
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
    justifyContent: "flex-start",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  messageCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  attemptText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  processingCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  processingText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: "#4B5563",
  },
  footer: {
    position: "absolute",
    justifyContent: "flex-end",
    zIndex: 10,
  },
  footerSpacer: {
    minHeight: 66,
  },
});
