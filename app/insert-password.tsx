import {
  Image,
  Keyboard,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { usePasswordsLoginForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { useRegisterAuthStore } from "@/store/register";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useAlerts } from "@/components/useAlert";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { PasswordLoginSchema } from "@/lib/password_validation";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

export default function InsertPassword() {
  const { AlertDisplay, showError, showWarning } = useAlerts();
  const { control, handleSubmit } = usePasswordsLoginForm();

  const { cpf, setPassword } = useRegisterAuthStore();
  const { mutate, isPending, isError } = useLoginMutation();

  useEffect(() => {
    if (isError) {
      showError("Acesso negado", "");
    }
  }, [isError]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: PasswordLoginSchema) => {
    if (!data.password) {
      showWarning("Atenção", "Por favor, insira sua senha.");
      return;
    }
    Keyboard.dismiss();
    setPassword(data.password || "");
    mutate({ cpf: cpf ?? "", password: data.password! });
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
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/images/apenas-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Senha de acesso</Text>
                <Text style={styles.welcomeSubtitle}>
                  Digite sua senha para acessar sua conta
                </Text>
              </View>

              {/* Password Input Card */}
              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="lock" size={20} color="#9BD13D" />
                  <Text style={styles.cardTitle}>Autenticação</Text>
                </View>

                <View style={styles.inputContainer}>
                  <FormInput
                    name="password"
                    control={control}
                    secureTextEntry
                    placeholder="Digite sua senha"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    icon={<FontAwesome6 name="key" size={24} color="#9CA3AF" />}
                  />

                  <TouchableOpacity
                    style={styles.forgotPasswordLink}
                    onPress={() => {
                      router.push("/(auth)/cpf-otp-screen");
                    }}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Esqueci minha senha
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isPending && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isPending}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={isPending ? "hourglass-empty" : "login"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {isPending ? "Verificando..." : "Entrar"}
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
  iconContainer: {
    backgroundColor: "#9BD13D",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
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
  loginButton: {
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
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#9BD13D",
    fontWeight: "500",
  },
});
