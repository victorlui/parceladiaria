import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
  const { data: dataRegister, setStep } = useRegisterStore();
  const [isLoading, setIsLoading] = useState(false);
  const [palencaConfig, setPalencaConfig] = useState<PalencaConfig | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const getSettings = async () => {
        try {
          const { data } = await api.get("v1/register/settings");

          const userProfession = dataRegister?.profissao ?? "";
          const isDriver = ["Motorista", "Motoboy"].includes(userProfession);
          const isPalencaEnabled = data?.data?.palenca.enabled ?? false;
          const hasCompletedPalenca = dataRegister?.palenca_status !== null;

          if (isDriver && isPalencaEnabled && !hasCompletedPalenca) {
            // Show Palenca step before TermsFinais
            const response = await api.post("/v1/palenca/init");

            const config = response.data?.data || response.data;
            setPalencaConfig(config);
          } else {
            // Skip to next screen
            router.replace("/(register)/termos");
          }
        } catch (_e) {
          return;
        } finally {
          setIsLoading(false);
        }
      };
      getSettings();
    }, [dataRegister?.profissao, dataRegister?.palenca_status]),
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.containerLoading}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (!palencaConfig) {
    return null;
  }

  const host = !palencaConfig.is_sandbox
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
      <View style={styles.footer}>
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

const styles = StyleSheet.create({
  containerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
