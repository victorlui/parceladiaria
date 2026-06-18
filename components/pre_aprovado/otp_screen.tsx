import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";

import { api } from "@/services/api";
import TermsFinalScreen from "./terms_final_screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import InputComponent from "../ui/Input";
import { Ionicons } from "@expo/vector-icons";
import { useAlerts } from "../useAlert";
import ButtonComponent from "../ui/Button";
import { router } from "expo-router";
import * as Network from "expo-network";
import { convertData } from "@/utils";
import { useAuthStore } from "@/store/auth";

const OtpScreen: React.FC = () => {
  const { showWarning, AlertDisplay } = useAlerts();
  const { userRegister } = useAuthStore();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSend = async () => {
    setLoading(true);
    try {
      await api.post("v1/terms/otp");
      if (!isOtpSent) {
        setIsOtpSent(true);
      }
    } catch (error) {
      setIsOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) return;

    setLoading(true);
    Keyboard.dismiss();

    try {
      // 1. Validação do código OTP
      await api.post("/v1/terms/check", { otp });

      // 2. Otimização: Busca o IP e faz o preview do contrato em paralelo
      // Ambas são necessárias mas não dependem uma da outra.
      const [ip] = await Promise.all([
        Network.getIpAddressAsync(),
        //api.post("v1/contract/preview", { valor: "600" }),
      ]);

      // 3. Preparação do payload com os dados coletados
      const payload = {
        sign_info_date: convertData(),
        sign_info_ip_address: ip || "0.0.0.0",
        sign_info_city: userRegister?.cidade ?? "São Paulo",
        sign_info_state: userRegister?.estado ?? "SP",
        sign_info_country: "BR",
      };

      // 4. Aceite final do termo
      // Se qualquer passo anterior falhar, esta chamada não será executada.
      await api.post("v1/client/acept-term", payload);

      Alert.alert(
        "Sucesso",
        "Contrato aceito com sucesso. Faça login novamente para continuar.",
        [{ text: "Entrar", onPress: () => router.replace("/login") }],
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao processar a verificação. Tente novamente.";
      showWarning("Atenção", errorMessage);
      setIsOtpSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <AlertDisplay />
      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
        <TermsFinalScreen onAccept={handleSend} loadingAccept={loading} />
      </ScrollView>

      <Modal animationType="fade" transparent visible={isOtpSent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackground}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsOtpSent(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={40}
                color={Colors.light.tint}
              />
            </View>

            <Text style={styles.title}>Verificação</Text>
            <Text style={styles.subtitle}>
              Insira o código de 6 dígitos enviado para o seu telefone
              registrado.
            </Text>

            <View style={{ width: "100%", gap: 20, marginTop: 10 }}>
              <InputComponent
                label="Código de Verificação"
                placeholder="000000"
                maskType="otp"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                error={
                  otp && otp.length < 6 ? "O código deve ter 6 dígitos" : ""
                }
              />

              <View style={{ gap: 12 }}>
                <ButtonComponent
                  title="Verificar Código"
                  disabled={otp.length < 6}
                  onPress={() => {
                    if (otp.length === 6) {
                      verifyOtp();
                    }
                  }}
                  loading={loading}
                  iconLeft={null}
                  iconRight={null}
                />

                <TouchableOpacity
                  onPress={handleSend}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendText}>Não recebeu o código? </Text>
                  <Text
                    style={[
                      styles.resendText,
                      { color: Colors.light.tint, fontWeight: "600" },
                    ]}
                  >
                    Reenviar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    padding: 24,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  resendButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    color: "#888",
  },
});

export default OtpScreen;
