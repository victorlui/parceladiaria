import { trackAppError } from "@/analytics/error-handler";
import {
  ANALYTICS_FLOWS,
  REGISTER_ANALYTICS_SOURCES,
} from "@/analytics/events";
import { Colors } from "@/constants/Colors";
import { api } from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface PalencaConfig {
  widget_id: string;
  external_id: string;
  is_sandbox: boolean;
}

export default function Palenca() {
  const { data: dataRegister, setStep, setData } = useRegisterStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [palencaConfig, setPalencaConfig] = useState<PalencaConfig | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const getSettings = async () => {
        try {
          const { data } = await api.get("v1/register/settings");
          const { data: dataClient } = await api.get("/v1/client");

          const userProfession = dataRegister?.profissao ?? "";
          const isDriver = ["Motorista", "Motoboy"].includes(userProfession);
          const isPalencaEnabled = data?.data?.palenca.enabled ?? false;
          const hasCompletedPalenca =
            dataClient.data.data.palenca_status !== null;

          if (isDriver && isPalencaEnabled && !hasCompletedPalenca) {
            setIsEligible(true);
          } else {
            // Skip to next screen
            await api.put("/v1/client/update", {
              etapa: Etapas.ACEITANDO_TERMOS,
            });
            setData({
              ...dataRegister,
              etapa: Etapas.ACEITANDO_TERMOS,
            });
            router.replace("/(register)/termos");
          }
        } catch (_e) {
          trackAppError(new Error("Erro ao carregar settings Palenca"), {
            flow: ANALYTICS_FLOWS.REGISTER,
            source: REGISTER_ANALYTICS_SOURCES.REGISTER_PALENCA_INIT,
          });
          return;
        } finally {
          setIsLoading(false);
        }
      };
      getSettings();
    }, [dataRegister?.profissao, dataRegister?.palenca_status]),
  );

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const response = await api.post("/v1/palenca/init");

      const config = response.data?.data || response.data;
      setPalencaConfig(config);
    } catch (_e) {
      trackAppError(new Error("Erro ao inicializar Palenca"), {
        flow: ANALYTICS_FLOWS.REGISTER,
        source: REGISTER_ANALYTICS_SOURCES.REGISTER_PALENCA_INIT,
      });
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

  if (!isEligible) {
    return null;
  }

  if (!palencaConfig) {
    return (
      <SafeAreaView style={styles.promptContainer}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              setStep(8);
              router.replace("/(register)/step1");
            }}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
          >
            <ArrowLeft size={20} color={Colors.black} />
          </Pressable>
        </View>
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
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace("/(register)/termos")}
          >
            <Text style={styles.skipButtonText}>Pular esta etapa</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const host = palencaConfig.is_sandbox
    ? "sandbox.palenca.com"
    : "connect.palenca.com";
  const url = `https://${host}/?widget_id=${palencaConfig.widget_id}&external_id=${palencaConfig.external_id}`;
  // https://sandbox.palenca.com/?widget_id=3b00f292-291b-47ee-9ade-d7e79ef29ff1&external_id=PD_396492

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            setStep(8);
            router.replace("/(register)/step1");
          }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
        >
          <ArrowLeft size={20} color={Colors.black} />
        </Pressable>
      </View>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        onShouldStartLoadWithRequest={(req) => {
          if (req.url.includes("palenca-done.php")) {
            router.replace("/(register)/termos");
            return false;
          }
          return true;
        }}
      />
      {/* <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace("/(register)/termos")}
        >
          <Text style={styles.skipButtonText}>Pular esta etapa</Text>
        </TouchableOpacity>
      </View> */}
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
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
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
