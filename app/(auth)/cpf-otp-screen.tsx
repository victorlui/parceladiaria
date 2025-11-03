import {
  Keyboard,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { StatusBar } from "expo-status-bar";
import { useCPFForm } from "@/hooks/useLoginForm";
import { useAlerts } from "@/components/useAlert";
import { CPFSchema } from "@/lib/cpf_validation";
import { FormInput } from "@/components/FormInput";
import { Colors } from "@/constants/Colors";
import { useState } from "react";
import api from "@/services/api";
import { router } from "expo-router";
import LogoComponent from "@/components/ui/Logo";

export default function CpfOtpScreen() {
  const { handleSubmit, control } = useCPFForm();
  const { AlertDisplay, showSuccess, showError } = useAlerts();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<"whatsapp" | "sms" | null>(
    null
  );

  const onSubmit = async (data: CPFSchema, method: "whatsapp" | "sms") => {
    Keyboard.dismiss();
    setIsLoading(true);
    setLoadingMethod(method);

    try {
      await api.post(`auth/otp`, {
        cpf: data.cpf,
        method: method,
      });

      //   const methodText = method === "whatsapp" ? "WhatsApp" : "SMS";
      //   showSuccess(
      //     "Código enviado!",
      //     `O código de verificação foi enviado via ${methodText} com sucesso.`
      //   );
      router.push({
        pathname: "/(auth)/otp-screen",
        params: {
          cpf: data.cpf,
          method: method,
        },
      });
    } catch (error) {
      console.log("error", error);
      showError(
        "Erro ao enviar código",
        "Não foi possível enviar o código. Verifique o CPF e tente novamente."
      );
    } finally {
      setIsLoading(false);
      setLoadingMethod(null);
    }
  };

  const onSubmitWhatsApp = (data: CPFSchema) => {
    onSubmit(data, "whatsapp");
  };

  const onSubmitSMS = (data: CPFSchema) => {
    onSubmit(data, "sms");
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
              <LogoComponent logoWithText={false} width={240} />

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Recuperar Senha</Text>
                <Text style={styles.welcomeSubtitle}>
                  Digite seu CPF para receber o código de verificação
                </Text>
              </View>

              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>CPF</Text>
                </View>

                <View style={styles.inputContainer}>
                  <FormInput
                    control={control}
                    name="cpf"
                    placeholder="000.000.000-00"
                    keyboardType="numeric"
                    rules={{ required: "CPF é obrigatório" }}
                    maskType="cpf"
                    returnKeyType="done"
                    icon={
                      <FontAwesome name="id-card" size={24} color="#9CA3AF" />
                    }
                  />
                </View>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.whatsappButton,
                      isLoading &&
                        loadingMethod !== "whatsapp" &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit(onSubmitWhatsApp)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading && loadingMethod === "whatsapp" ? (
                      <MaterialIcons
                        name="hourglass-empty"
                        size={20}
                        color="#FFFFFF"
                      />
                    ) : (
                      <FontAwesome name="whatsapp" size={20} color="#FFFFFF" />
                    )}
                    <Text style={styles.buttonText}>
                      {isLoading && loadingMethod === "whatsapp"
                        ? "Enviando..."
                        : "Enviar via WhatsApp"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.smsButton,
                      isLoading &&
                        loadingMethod !== "sms" &&
                        styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit(onSubmitSMS)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading && loadingMethod === "sms" ? (
                      <MaterialIcons
                        name="hourglass-empty"
                        size={20}
                        color="#FFFFFF"
                      />
                    ) : (
                      <MaterialIcons name="sms" size={20} color="#FFFFFF" />
                    )}
                    <Text style={styles.buttonText}>
                      {isLoading && loadingMethod === "sms"
                        ? "Enviando..."
                        : "Enviar via SMS"}
                    </Text>
                  </TouchableOpacity>
                </View>
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
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: "100%",
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
  buttonsContainer: {
    gap: 12,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  smsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
