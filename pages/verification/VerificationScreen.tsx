import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import LogoComponent from "@/components/ui/Logo";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useVerificationStore } from "@/store/validation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoginHook } from "../login/hooks/useLoginHook";

const VerificationScreen: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useAlerts();
  const { loginMutation } = useLoginHook();
  const { data } = useVerificationStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const canConfirm = useMemo(() => code.trim().length === 6, [code]);
  const canResend = useMemo(() => resendTimer === 0, [resendTimer]);
  const resendTimerLabel = useMemo(() => {
    const mm = String(Math.floor(resendTimer / 60)).padStart(2, "0");
    const ss = String(resendTimer % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [resendTimer]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timeoutId = setTimeout(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [resendTimer]);

  const handleConfirm = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      await api.post("/auth/login-otp", {
        cpf: data?.cpf,
        otp: code,
      });

      if (!data?.password) {
        showError(
          "Atenção",
          "Não foi possível recuperar a senha para concluir o login.",
        );
        return;
      }

      showSuccess(
        "Sucesso",
        "Código validado com sucesso. Entre novamente",
        () => {
          router.replace("/login");
        },
      );
    } catch (error: any) {
      showError(
        "Atenção",
        error.response.message || "Código inválido ou Expirado.",
      );
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await api.post("auth/otp", {
        cpf: data?.cpf || "",
      });
      showSuccess("Sucesso", "Código reenviado com sucesso");
      setResendTimer(60);
    } catch (error: any) {
      showError(
        "Atenção",
        error.response.message || "Erro ao enviar código novamente.",
      );
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleSendByEmail = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await api.post("auth/otp", {
        cpf: data?.cpf || "",
        channel: "email",
      });
      showSuccess("Sucesso", "Código reenviado com sucesso");
      setResendTimer(60);
    } catch (error: any) {
      showError(
        "Atenção",
        error.response.message || "Erro ao enviar código novamente.",
      );
      return;
    } finally {
      setLoading(false);
    }
  };
  const handleBackToLogin = () => router.replace("/login");

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.logoWrapper}>
              <LogoComponent logoWithText={false} width={200} />
            </View>

            <Text style={styles.title}>Verificação</Text>

            <Text style={styles.subtitle}>
              Por segurança, enviamos um código para o telefone{" "}
              <Text style={styles.subtitleStrong}>{data?.phone_masked}</Text>.
              Digite o código para continuar.
            </Text>

            <View style={styles.form}>
              <InputComponent
                value={code}
                onChangeText={setCode}
                placeholder="Código de 6 dígitos"
                keyboardType="number-pad"
                maskType="otp"
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
                icon={
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={Colors.gray.primary}
                  />
                }
              />

              <View style={styles.buttonWrapper}>
                <ButtonComponent
                  title="Confirmar"
                  onPress={handleConfirm}
                  iconLeft={null}
                  iconRight={null}
                  disabled={!canConfirm}
                  loading={loading || loginMutation.isPending}
                />
              </View>

              <View style={styles.links}>
                {!canResend ? (
                  <Text style={styles.timerText}>
                    Você poderá reenviar em{" "}
                    <Text style={styles.timerStrong}>{resendTimerLabel}</Text>
                  </Text>
                ) : (
                  <>
                    <View style={styles.linkRow}>
                      <Text style={styles.linkMuted}>Não recebeu? </Text>
                      <TouchableOpacity
                        onPress={handleResendCode}
                        activeOpacity={0.8}
                        disabled={loading || loginMutation.isPending}
                      >
                        <Text style={styles.linkAction}>Reenviar codigo</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={handleSendByEmail}
                      activeOpacity={0.8}
                      disabled={loading || loginMutation.isPending}
                    >
                      <Text style={styles.linkAction}>
                        Enviar codigo por email
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  onPress={handleBackToLogin}
                  activeOpacity={0.8}
                  disabled={loading || loginMutation.isPending}
                >
                  <Text style={styles.linkAction}>Voltar ao login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.green.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 320,
  },
  subtitleStrong: {
    fontWeight: "bold",
    color: Colors.black,
  },
  form: {
    width: "100%",
    maxWidth: 420,
  },
  buttonWrapper: {
    marginTop: 16,
  },
  links: {
    marginTop: 18,
    alignItems: "center",
    gap: 10,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkMuted: {
    fontSize: 13,
    color: Colors.gray.text,
  },
  linkAction: {
    fontSize: 13,
    color: Colors.green.text,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  timerText: {
    fontSize: 13,
    color: Colors.gray.text,
    textAlign: "center",
  },
  timerStrong: {
    fontWeight: "bold",
    color: Colors.black,
  },
});

export default VerificationScreen;
