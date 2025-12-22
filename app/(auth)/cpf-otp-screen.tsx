import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CPFOTPScreen: React.FC = () => {
  const { AlertDisplay, showError } = useAlerts();
  const { register } = useAuthStore();
  const cpfRef = useRef<TextInput>(null);
  const otpRef = useRef<TextInput>(null);
  const [cpf, setCpf] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");

  const [canResend, setCanResend] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startResendTimer = () => {
    setCanResend(false);
    setRemainingSeconds(60);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (method: string) => {
    Keyboard.dismiss();
    if (!cpf) {
      showError("Atenção", "CPF obrigatório");
      return;
    }

    if (!cpf) {
      showError("Atenção", "CPF inválido");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/otp", {
        cpf,
      });

      setIsSuccess(true);
      startResendTimer();
    } catch (error: any) {
      console.log(error.response);
      showError("Atenção", "Erro ao enviar código verifique o CPF");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOTP = async () => {
    Keyboard.dismiss();
    if (!otp) {
      showError("Atenção", "Código OTP obrigatório");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login-otp", {
        cpf,
        otp,
      });

      register(res.data.data.token, {
        cpf: res.data.data.cpf,
        nome: res.data.data.nome,
        pixKey: "",
      });
      setIsSuccess(false);
      setCpf("");
      setOtp("");
      setRemainingSeconds(0);
      router.push("/(auth)/change-password-screen");
    } catch (error) {
      showError("Atenção", "Código OTP inválido ou expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AlertDisplay />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo-verde.png")}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>Parcela Diária</Text>
          {isSuccess && (
            <Text style={styles.subtitle}>
              Enviamos um código de verificação via WhatsApp. Insira-o abaixo.
            </Text>
          )}

          {!isSuccess && (
            <Text style={styles.subtitle}>
              Digite seu CPF para recuperar a senha
            </Text>
          )}

          <View style={styles.formContainer}>
            {!isSuccess && (
              <InputComponent
                ref={cpfRef}
                placeholder="Seu CPF"
                keyboardType="numeric"
                maxLength={11}
                value={cpf}
                maskType="cpf"
                icon={
                  <FontAwesome
                    name="vcard"
                    size={20}
                    color={Colors.gray.primary}
                  />
                }
                onChangeText={setCpf}
                returnKeyType="done"
                onSubmitEditing={() => onSubmit("sms")}
              />
            )}

            {isSuccess && (
              <InputComponent
                ref={otpRef}
                placeholder="Código OTP"
                keyboardType="numeric"
                maxLength={6}
                value={otp}
                icon={
                  <Ionicons
                    name="key-sharp"
                    size={20}
                    color={Colors.gray.primary}
                  />
                }
                onChangeText={setOtp}
                returnKeyType="done"
                onSubmitEditing={confirmOTP}
              />
            )}
          </View>
          <View style={styles.footerContainer}>
            {isLoading && (
              <ActivityIndicator size={30} color={Colors.green.primary} />
            )}

            {!isLoading && (
              <ButtonComponent
                title={isSuccess ? "Confirmar código" : "Enviar Código"}
                onPress={isSuccess ? confirmOTP : () => onSubmit("sms")}
                iconLeft={null}
              />
            )}

            {isSuccess && !canResend && (
              <View style={styles.resendTimerContainer}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.gray.primary}
                />
                <Text style={styles.resendTimerText}>
                  Você poderá reenviar o código em{" "}
                  {String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:
                  {String(remainingSeconds % 60).padStart(2, "0")}
                </Text>
              </View>
            )}

            {isSuccess && canResend && !isLoading && (
              <TouchableOpacity
                style={styles.sendCodeContainer}
                onPress={() => onSubmit("sms")}
              >
                <Text style={styles.sendCodeText}>
                  Não recebeu? Reenviar código
                </Text>
              </TouchableOpacity>
            )}
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  logo: {
    height: 100,
    width: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.green.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.primary,
    textAlign: "center",
    marginBottom: 24,
  },
  formContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },
  footerContainer: {
    width: "100%",
    marginTop: 24,
    justifyContent: "center",
    gap: 14,
  },
  forgotPasswordContainer: {
    padding: 3,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: Colors.green.primary,
    textDecorationLine: "underline",
    textAlign: "center",
    fontWeight: "bold",
  },
  sendCodeContainer: {
    width: "100%",
    alignItems: "flex-start",
  },
  sendCodeText: {
    fontSize: 16,
    color: Colors.green.primary,
    textAlign: "center",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  resendTimerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  resendTimerText: {
    fontSize: 14,
    color: Colors.gray.primary,
    textAlign: "center",
  },
});

export default CPFOTPScreen;
