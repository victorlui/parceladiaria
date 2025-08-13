import { useEffect, useState, useRef,useCallback } from "react";
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
import { FormInput } from "@/components/FormInput";
import { usePhoneForm } from "@/hooks/useRegisterForm";
import {
  useRegisterMutation,
  useCheckOTPMutation,
} from "@/hooks/useRegisterMutation";
import { PhoneSchema } from "@/lib/phone_validation";
import { useRegisterAuthStore } from "@/store/register";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAlerts } from "@/components/useAlert";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";


export default function PhoneScreen() {
  const { control, handleSubmit, getValues } = usePhoneForm();
  const { mutate, isPending, data } = useRegisterMutation();
  const { setPhone } = useRegisterAuthStore();
  const { AlertDisplay, showWarning, showSuccess, showError,hideAlert } = useAlerts();
  const mutation = useCheckOTPMutation();
  const [sendCode, setSendCode] = useState(false);
  const [code, setCode] = useState("");
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [whatsappTimer, setWhatsappTimer] = useState(0);
  const [canUseWhatsapp, setCanUseWhatsapp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const whatsappTimerRef = useRef<NodeJS.Timeout | null>(null);

  const number = getValues("phone");

  // Reset states when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset all states to initial values when screen gains focus
      setSendCode(false);
      setCode("");
      setHasShownSuccess(false);
      setCanResend(true);
      setResendTimer(0);
      setCanUseWhatsapp(false);
      setWhatsappTimer(0);
      
      // Clear any existing timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (whatsappTimerRef.current) {
        clearTimeout(whatsappTimerRef.current);
        whatsappTimerRef.current = null;
      }
      
      // Reset mutation state to prevent success modal from showing
      mutation.reset();
    }, [])
  );

  useEffect(() => {
    if (mutation.isError) {
      showError("Erro", mutation.error?.message || "Erro desconhecido");
    }
  }, [mutation.isError, mutation.error?.message]); 

  useEffect(() => {
    // Only show success if we actually sent a code and it was successful
    if (mutation.isSuccess && !hasShownSuccess && sendCode) {
      setHasShownSuccess(true);
      showSuccess("Sucesso", "Código verificado com sucesso", () => {
        hideAlert();
        router.push("/(register)/create-password");
      });
    }
  }, [mutation.isSuccess, hasShownSuccess, sendCode]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Timer effect for WhatsApp button (1 minute)
  useEffect(() => {
    if (whatsappTimer > 0) {
      whatsappTimerRef.current = setTimeout(() => {
        setWhatsappTimer(whatsappTimer - 1);
      }, 1000);
    } else if (whatsappTimer === 0 && !canUseWhatsapp) {
      setCanUseWhatsapp(true);
    }

    return () => {
      if (whatsappTimerRef.current) {
        clearTimeout(whatsappTimerRef.current);
      }
    };
  }, [whatsappTimer, canUseWhatsapp]);



  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (whatsappTimerRef.current) {
        clearTimeout(whatsappTimerRef.current);
      }
    };
  }, []);

  const onSubmit = (data: PhoneSchema) => {
    if (data.phone.length !== 11) {
      showError(
        "Erro",
        "Número de telefone inválido. Digite 11 dígitos incluindo DDD"
      );
      return;
    }

    const areaCode = data.phone.substring(0, 2);
    if (parseInt(areaCode) < 11 || parseInt(areaCode) > 99) {
      showError("Erro", "DDD inválido");
      return;
    }

    // If validation passes, proceed with sending code
    Keyboard.dismiss();
    setSendCode(true);
    setCanUseWhatsapp(false);
    setWhatsappTimer(60); // Start 1 minute timer for WhatsApp button
    mutate({ phone: data.phone, method: "sms" });
  };

  const handleSubmitagain = () => {
    if (!canResend) return;
    
    const phoneNumber = data?.data?.phone ?? number ?? "";
    if (!phoneNumber) {
      showError("Erro", "Número de telefone não encontrado");
      return;
    }

    mutate({ phone: phoneNumber, method: "whatsapp" });
    showSuccess("Código enviado", "Novo código foi enviado via WhatsApp");
    
    // Start 15 second timer for resend
    setCanResend(false);
    setResendTimer(15);
  };

  const handleSendCode = (code: string) => {
    if (!code || code.length !== 6) {
      showWarning("Atenção", "Insira um código válido de 6 dígitos");
      return;
    }

    Keyboard.dismiss();
    setPhone(number);
    hideAlert();
    
    mutation.mutate({
      phone: number ?? "",
      code,
    });
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
            <View style={[styles.content,{gap: sendCode ? 0 : 20}]}>
               <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
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
              

                <Text style={styles.welcomeTitle}>
                  {!sendCode ? "Verificação" : "Código Enviado"}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  {!sendCode 
                    ? "Insira seu número de telefone (WhatsApp) para receber um código de verificação"
                    : `Um código de 6 dígitos foi enviado para ${number?.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3") || ""}`
                  }
                </Text>

                {sendCode && (
                  <TouchableOpacity 
                    style={styles.changeNumberButton}
                    onPress={() => {
                      setSendCode(false);
                      setHasShownSuccess(false);
                      setCanResend(true);
                      setResendTimer(0);
                      setCanUseWhatsapp(false);
                      setWhatsappTimer(0);
                      if (timerRef.current) {
                        clearTimeout(timerRef.current);
                      }
                      if (whatsappTimerRef.current) {
                        clearTimeout(whatsappTimerRef.current);
                      }
                    }}
                  >
                    <Text style={styles.changeNumberText}>Mudar o número</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="phone" size={20} color="#9BD13D" />
                  <Text style={styles.cardTitle}>
                    {!sendCode ? "Telefone" : "Código de Verificação"}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  {!sendCode ? (
                    <FormInput
                      name="phone"
                      placeholder="(00) 00000-0000"
                      control={control}
                      rules={{ required: "Telefone é obrigatório" }}
                      maskType="phone"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      icon={
                        <FontAwesome name="phone-square" size={24} color="#9CA3AF" />
                      }
                    />
                  ) : (
                    <AppleOTPInput
                      sendCode={(code) => {
                        setCode(code);
                        handleSendCode(code);
                      }}
                    />
                  )}
                </View>

                {sendCode && (
                  <TouchableOpacity
                    style={[
                      styles.whatsappButton,
                      (!canResend || !canUseWhatsapp) && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmitagain}
                    disabled={!canResend || !canUseWhatsapp}
                  >
                    <MaterialIcons
                      name="message"
                      size={20}
                      color={(!canResend || !canUseWhatsapp) ? "#9CA3AF" : "#9BD13D"}
                    />
                    <Text style={[
                      styles.whatsappButtonText,
                      (!canResend || !canUseWhatsapp) && styles.buttonTextDisabled,
                    ]}>
                      {!canUseWhatsapp 
                        ? `Reenviar código em ${Math.floor(whatsappTimer / 60)}:${(whatsappTimer % 60).toString().padStart(2, '0')}`
                        : !canResend 
                          ? `Aguarde ${resendTimer}s para reenviar`
                          : 'Receber código via WhatsApp'
                      }
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isPending && styles.buttonDisabled,
                  ]}
                  onPress={
                    !sendCode
                      ? handleSubmit(onSubmit)
                      : code
                        ? () => handleSendCode(code)
                        : () => showWarning("Atenção", "Insira o código de verificação")
                  }
                  disabled={isPending}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={isPending ? "hourglass-empty" : "arrow-forward"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {isPending ? "Verificando..." : "Continuar"}
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
  iconContainer: {
    backgroundColor: "#9BD13D",
    padding: 16,
    borderRadius: 16,
    
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
  },
  changeNumberButton: {
    marginTop: 8,
  },
  changeNumberText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
    textDecorationLine: "underline",
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
  whatsappButton: {
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
  whatsappButtonText: {
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
