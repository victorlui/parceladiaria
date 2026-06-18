import { AnalyticsService } from "@/analytics/analytics.service";
import {
  ANALYTICS_FLOWS,
  DIVERGENCIA_ANALYTICS_SOURCES,
  DIVERGENCIA_SCREENS,
} from "@/analytics/events";
import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { api, withAnalytics } from "@/services/api";
import { AlertCircle, Landmark, Lock, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FlowState = "idle" | "connecting" | "analyzing" | "retry" | "denied";

type Props = {
  back: () => void;
  onConnected: () => void;
};

export default function Openfinance({ back, onConnected }: Props) {
  const { AlertDisplay, showError } = useAlerts();
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [attempts, setAttempts] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState(
    "Conectando sua conta bancária...",
  );

  const appState = useRef(AppState.currentState);
  const isLeaving = useRef(false);

  useEffect(() => {
    AnalyticsService.screen(DIVERGENCIA_SCREENS.OPEN_FINANCE, {
      flow: ANALYTICS_FLOWS.DIVERGENCIA,
    });
  }, []);

  const connectKlavi = useCallback(async () => {
    if (isLeaving.current) return;

    try {
      setFlowState("connecting");

      const { data } = await api.post(
        "/v1/klavi/connect",
        {
          redirect: "expotemplatebase://register-openfinance",
        },
        withAnalytics({
          flow: ANALYTICS_FLOWS.DIVERGENCIA,
          source: DIVERGENCIA_ANALYTICS_SOURCES.OPEN_FINANCE_CONNECT,
        }),
      );

      if (isLeaving.current) return;

      const url = data?.data?.body?.linkURL;

      if (url) {
        Linking.openURL(url);
      } else {
        setFlowState("idle");
      }
    } catch (error: any) {
      setFlowState("idle");
      showError(
        "Erro",
        error?.message ||
          "Não foi possível conectar sua conta. Tente novamente.",
      );
    }
  }, [showError]);

  const checkAnalysisStatus = useCallback(async () => {
    if (isLeaving.current) return;

    try {
      const { data } = await api.get(
        "/v1/cliente/check-status",
        withAnalytics({
          flow: ANALYTICS_FLOWS.DIVERGENCIA,
          source: DIVERGENCIA_ANALYTICS_SOURCES.OPEN_FINANCE_CHECK_STATUS,
        }),
      );
      if (isLeaving.current) return;

      const status = data?.status;
      setAttempts(data?.r_attempts || 0);

      if (status === "aprovado" || status === "completed") {
        isLeaving.current = true;
        onConnected();
        back();
        return;
      }

      if (data?.r_attempts > 0) {
        setFlowState("retry");
        return;
      }

      setFlowState("denied");
    } catch (error: any) {
      setFlowState("idle");
    }
  }, [back, onConnected]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (flowState === "connecting") {
          setFlowState("analyzing");
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [flowState]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (flowState === "analyzing") {
      setLoadingMessage("Analisando seus dados bancários...");
      checkAnalysisStatus();
      intervalId = setInterval(checkAnalysisStatus, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkAnalysisStatus, flowState]);

  return (
    <View style={styles.container}>
      <AlertDisplay />

      <TouchableOpacity onPress={back} style={styles.backButton}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      {flowState === "connecting" || flowState === "analyzing" ? (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.green.primary} />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
          {flowState === "analyzing" && (
            <Text style={styles.hintText}>
              Isso pode levar alguns segundos...
            </Text>
          )}
        </View>
      ) : flowState === "retry" ? (
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: "#FFF7ED" }]}>
            <AlertCircle size={40} color="#f97316" />
          </View>

          <Text style={styles.title}>Tentar novamente</Text>
          <Text style={styles.subtitle}>
            Você tem {attempts} tentativas restantes. Conecte outra conta
            bancária.
          </Text>

          <ButtonComponent
            title="Conectar outra conta"
            iconLeft={null}
            iconRight={null}
            onPress={connectKlavi}
          />
        </View>
      ) : flowState === "denied" ? (
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: "#FEF2F2" }]}>
            <X size={40} color="#ef4444" />
          </View>

          <Text style={styles.title}>Não foi possível aprovar</Text>
          <Text style={styles.subtitle}>
            Você não tem mais tentativas disponíveis no momento.
          </Text>

          <ButtonComponent
            title="Voltar"
            iconLeft={null}
            iconRight={null}
            outline
            onPress={back}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: "#F0FDFA" }]}>
            <Landmark size={40} color="#0f766e" />
          </View>

          <Text style={styles.title}>Conecte sua conta</Text>
          <Text style={styles.subtitle}>
            Você tem {attempts} tentativas restantes. Conecte sua melhor conta
            para concluir seu cadastro.
          </Text>

          <ButtonComponent
            title="Conectar Conta"
            iconLeft={null}
            iconRight={null}
            onPress={connectKlavi}
          />

          <View style={styles.secureRow}>
            <Lock size={14} color="#9ca3af" style={{ marginRight: 6 }} />
            <Text style={styles.secureText}>
              Conexão segura via Open Finance
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  backButtonText: {
    color: "#11181C",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    marginBottom: 20,
    height: 96,
    width: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#11181C",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#11181C",
    textAlign: "center",
  },
  hintText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  secureRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  secureText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
});
