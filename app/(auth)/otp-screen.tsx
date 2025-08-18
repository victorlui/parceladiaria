import { useEffect, useState, useRef, useCallback } from "react";
import {
  Keyboard,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AppleOTPInput from "@/components/AppleOTP";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAlerts } from "@/components/useAlert";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import api from "@/services/api";
import { generateSignature } from "@/utils";
import { useAuthStore } from "@/store/auth";

export default function OtpScreen() {
  const { AlertDisplay, showWarning, showSuccess, showError, hideAlert } =
    useAlerts();
  const [code, setCode] = useState("");
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const params = useLocalSearchParams();
  const { setToken, setUser } = useAuthStore();

  // Reset states when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setCode("");
      setHasShownSuccess(false);
      setCanResend(true);
      setResendTimer(0);
      setIsLoading(false);

      // Clear any existing timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, [])
  );

  // Timer effect for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resendTimer, canResend]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      setIsLoading(true);

      await api.post(`auth/otp`, {
        cpf: params.cpf,
        method: params.method,
      });

      showSuccess(
        "Código enviado",
        "Novo código foi enviado para seu telefone"
      );

      // Start 30 second timer for resend
      setCanResend(false);
      setResendTimer(30);
    } catch (error: any) {
      showError(
        "Erro",
        error.response?.data?.message ||
          "Erro ao reenviar código. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (code: string) => {
    if (!code || code.length !== 6) {
      showWarning("Atenção", "Insira um código válido de 6 dígitos");
      return;
    }

    if (!params.cpf) {
      showError("Erro", "CPF não encontrado. Volte e tente novamente.");
      return;
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss();

      const response = await api.post("auth/login-otp", {
        cpf: params.cpf,
        otp: code,
      });

      console.log("response", response);

      showSuccess("Sucesso", "Código verificado com sucesso!", () => {
        hideAlert();
        setToken(response.data.data.token);
        setUser(response.data.user);

        router.replace("/(auth)/change-password-screen");
      });
    } catch (error: any) {
      console.log("error", error.response);
      showError(
        "Código Inválido",
        "O código inserido está incorreto. Verifique e tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <AlertDisplay />

      <LinearGradient
        colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  disabled={isLoading}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/images/apenas-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Código de Verificação</Text>
                <Text style={styles.welcomeSubtitle}>
                  Digite o código de 6 dígitos que foi enviado para seu telefone
                </Text>
                {params.cpf && (
                  <Text style={styles.cpfText}>
                    CPF:{" "}
                    {String(params.cpf).replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/,
                      "$1.$2.$3-$4"
                    )}
                  </Text>
                )}
              </View>

              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={20}
                    color="#9BD13D"
                  />
                  <Text style={styles.cardTitle}>Código de Verificação</Text>
                </View>

                <View style={styles.inputContainer}>
                  <AppleOTPInput
                    sendCode={(code) => {
                      setCode(code);
                      if (code.length === 6) {
                        handleSendCode(code);
                      }
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.resendButton,
                    (!canResend || isLoading) && styles.buttonDisabled,
                  ]}
                  onPress={handleResendCode}
                  disabled={!canResend || isLoading}
                >
                  <MaterialIcons
                    name={isLoading ? "hourglass-empty" : "refresh"}
                    size={20}
                    color={!canResend || isLoading ? "#9CA3AF" : "#9BD13D"}
                  />
                  <Text
                    style={[
                      styles.resendButtonText,
                      (!canResend || isLoading) && styles.buttonTextDisabled,
                    ]}
                  >
                    {isLoading
                      ? "Enviando..."
                      : !canResend
                        ? `Reenviar código em ${resendTimer}s`
                        : "Reenviar código"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    if (code && code.length === 6) {
                      handleSendCode(code);
                    } else {
                      showWarning(
                        "Atenção",
                        "Insira o código de verificação completo"
                      );
                    }
                  }}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={isLoading ? "hourglass-empty" : "arrow-forward"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {isLoading ? "Verificando..." : "Verificar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 20,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    height: 140,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  cpfText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#9BD13D",
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9BD13D",
    marginLeft: 8,
    textAlign: "center",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9BD13D",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
    borderColor: "#D1D5DB",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  buttonTextDisabled: {
    color: "#9CA3AF",
  },
});
