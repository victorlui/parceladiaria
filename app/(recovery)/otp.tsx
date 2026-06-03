import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function OtpScreen() {
  const { AlertDisplay, showWarning, showSuccess } = useAlerts();
  const cpfValid = useAuthStore((state) => state.cpfValid);
  const { token, data: registerData, setData, setToken } = useRegisterStore();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);

  const otpDigits = useMemo(() => otp.replace(/\D/g, "").slice(0, 6), [otp]);
  const canSubmit = otpDigits.length === 6;

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeOtp = (value: string) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleConfirmCode = async () => {
    Keyboard.dismiss();
    if (!cpfValid) {
      showWarning("Erro", "Sessao de recuperacao invalida.");
      return;
    }

    if (!otpDigits || otpDigits.length !== 6) {
      showWarning("Atenção", "Codigo OTP obrigatorio");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        cpf: cpfValid,
        otp: otpDigits,
      };

      const res = await api.post("auth/verify-identity", payload);
      const responseData = res.data?.data;
      const recoveryToken = responseData?.token ?? token ?? null;

      if (recoveryToken) {
        setToken(recoveryToken);
      }

      setData({
        ...(registerData ?? {}),
        cpf: responseData?.cpf ?? cpfValid,
        nome: responseData?.nome ?? responseData?.name ?? registerData?.nome,
        id: responseData?.id ?? registerData?.id,
      });

      router.push("/(recovery)/change-password");
    } catch (error: any) {
      showWarning(
        "Atenção",
        error?.response?.data?.message || "Codigo OTP invalido ou expirado.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || isLoading) return;
    if (!cpfValid) {
      showWarning("Erro", "Sessao de recuperacao invalida.");
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await api.post("/auth/recovery/start", {
        cpf: cpfValid,
      });
      setOtp("");
      setTimer(45);
      showSuccess("Sucesso", "Codigo enviado com sucesso.");
    } catch (error: any) {
      showWarning(
        "Erro",
        error?.response?.data?.message || "Nao foi possivel reenviar o codigo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <AlertDisplay />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require("@/assets/images/logo-verde.png")}
              resizeMode="cover"
              style={styles.logo}
            />

            <View style={styles.content}>
              <Text style={styles.title}>Verificação</Text>

              <Text style={styles.subtitle}>
                Por segurança, enviamos um código para o telefone cadastrado.
                Digite o código para continuar.
              </Text>

              <View style={styles.card}>
                <InputComponent
                  value={otpDigits}
                  onChangeText={handleChangeOtp}
                  placeholder="Codigo de 6 digitos"
                  keyboardType="number-pad"
                  maskType="otp"
                  returnKeyType="done"
                  onSubmitEditing={handleConfirmCode}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  icon={
                    <Ionicons
                      name="key-outline"
                      size={18}
                      color={Colors.gray.primary}
                    />
                  }
                />

                <View style={styles.resendContainer}>
                  {timer > 0 ? (
                    <Text style={styles.infoText}>
                      Reenviar codigo em{" "}
                      <Text style={styles.infoTextStrong}>
                        {formatTimer(timer)}
                      </Text>
                    </Text>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleResendCode}
                      style={styles.resendButton}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.resendText,
                          isLoading && styles.resendTextDisabled,
                        ]}
                      >
                        Reenviar codigo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ButtonComponent
                title="Confirmar codigo"
                onPress={handleConfirmCode}
                loading={isLoading}
                iconLeft={null}
                iconRight="arrow-forward"
                disabled={!canSubmit || isLoading}
              />

              <View style={styles.loginRow}>
                <TouchableOpacity
                  onPress={() => router.push("/login")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginAction}>Voltar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backLinkContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.green.primary,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  content: {
    width: "100%",
    maxWidth: 420,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.green.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray.text,
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    width: "100%",
    marginBottom: 20,
  },
  resendContainer: {
    marginTop: 6,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minHeight: 26,
  },
  infoText: {
    fontSize: 13,
    color: Colors.gray.text,
    textAlign: "center",
  },
  infoTextStrong: {
    fontWeight: "700",
    color: Colors.black,
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.green.primary,
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: Colors.gray.primary,
    textDecorationLine: "none",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  loginText: {
    fontSize: 15,
    color: Colors.gray.text,
  },
  loginAction: {
    fontSize: 15,
    color: Colors.green.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
