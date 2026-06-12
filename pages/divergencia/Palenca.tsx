import { AnalyticsService } from "@/analytics/analytics.service";
import {
  ANALYTICS_FLOWS,
  DIVERGENCIA_ANALYTICS_SOURCES,
  DIVERGENCIA_SCREENS,
} from "@/analytics/events";
import { Colors } from "@/constants/Colors";
import api, { withAnalytics } from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import PulsingImageLoader from "../register/components/PulsingImageLoader";
import { useFinalizeDivergenciaFlow } from "./hook/useFinalizeDivergenciaFlow";

interface PalencaConfig {
  widget_id: string;
  external_id: string;
  is_sandbox: boolean;
}

export default function PalencaDivergente() {
  const { data, setStep } = useRegisterStore();
  const { finalizeDivergenciaFlow, loadingSubmit } =
    useFinalizeDivergenciaFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [palencaConfig, setPalencaConfig] = useState<PalencaConfig | null>(
    null,
  );

  useEffect(() => {
    AnalyticsService.screen(DIVERGENCIA_SCREENS.PALENCA, {
      flow: ANALYTICS_FLOWS.DIVERGENCIA,
    });
  }, []);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const response = await api.post(
        "/v1/palenca/init",
        {},
        withAnalytics({
          flow: ANALYTICS_FLOWS.DIVERGENCIA,
          source: DIVERGENCIA_ANALYTICS_SOURCES.PALENCA_INIT,
        }),
      );
      console.log("response", response);
      const config = response.data?.data || response.data;
      setPalencaConfig(config);
    } catch (_e) {
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.containerLoading}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (!palencaConfig) {
    return (
      <SafeAreaView style={styles.promptContainer}>
        <View style={styles.promptContent}>
          <Image
            source={require("@/assets/images/logo-verde.png")}
            style={styles.logo}
          />

          <View>
            <Text style={styles.title}>Validação automática da sua renda</Text>
            <Text style={styles.description}>
              Conecte o app que você usa pra rodar e tenha maiores chance de
              aprovação. É rápido, seguro e adianta sua análise.
            </Text>
          </View>
        </View>
        <View style={styles.promptActions}>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnect}
          >
            <Text style={styles.connectButtonText}>Conectar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loadingSubmit) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text="Finalizando..."
      />
    );
  }

  const host = palencaConfig.is_sandbox
    ? "sandbox.palenca.com"
    : "connect.palenca.com";
  const url = `https://${host}/?widget_id=${palencaConfig.widget_id}&external_id=${palencaConfig.external_id}`;
  // https://sandbox.palenca.com/?widget_id=3b00f292-291b-47ee-9ade-d7e79ef29ff1&external_id=PD_396492

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        onShouldStartLoadWithRequest={(req) => {
          if (req.url.includes("palenca-done.php")) {
            finalizeDivergenciaFlow();
            return false;
          }
          return true;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  promptContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  promptContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    color: "#666",
    textAlign: "center",
    maxWidth: 320,
  },
  promptActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  connectButton: {
    backgroundColor: Colors.green.button,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  logo: {
    width: 100,
    height: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eaeaea",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});
