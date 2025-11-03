import {
  Image,
  Keyboard,
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { usePasswordsForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { PasswordsSchema } from "@/lib/passwords._validation";
import { changePassword } from "@/services/loans";
import { useRef, useState } from "react";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAlerts } from "@/components/useAlert";
import api from "@/services/api";
import LogoComponent from "@/components/ui/Logo";

const ChangePasswordScreen: React.FC = () => {
  const { control, handleSubmit } = usePasswordsForm();
  const [isLoading, setIsLoading] = useState(false);
  const { AlertDisplay, showError, showSuccess, hideAlert } = useAlerts();
  const formRefs = [useRef<TextInput>(null), useRef<TextInput>(null)];

  const onSubmit = async (data: PasswordsSchema) => {
    if (!data.password) {
      showError("Erro", "Por favor, digite uma nova senha.");
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await api.post("/v1/client/change-password", {
        password: data.password,
      });
      console.log("response", response);

      showSuccess("Sucesso", "Senha alterada com sucesso!", () => {
        hideAlert();
        router.replace("/login");
      });
    } catch (error: unknown) {
      throw error;
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
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <LogoComponent logoWithText={false} width={240} />

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Alterar senha</Text>
                <Text style={styles.welcomeSubtitle}>
                  Digite sua nova senha e confirme para alterar
                </Text>
              </View>

              <View style={styles.tipsCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="security" size={20} color="#9BD13D" />
                  <Text style={styles.cardTitle}>Dicas de Segurança</Text>
                </View>

                <View style={styles.tipItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.tipText}>
                    Use pelo menos 6 caracteres
                  </Text>
                </View>

                <View style={styles.tipItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.tipText}>
                    Inclua letras maiúsculas e minúsculas
                  </Text>
                </View>

                <View style={styles.tipItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.tipText}>
                    Adicione números e símbolos
                  </Text>
                </View>

                <View style={styles.tipItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#10B981"
                  />
                  <Text style={styles.tipText}>Evite espaços em branco</Text>
                </View>
              </View>

              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <FontAwesome6 name="lock" size={20} color="#9BD13D" />
                  <Text style={styles.cardTitle}>Nova Senha</Text>
                </View>

                <View style={styles.inputContainer}>
                  <FormInput
                    name="password"
                    control={control}
                    secureTextEntry
                    label="Nova senha"
                    onSubmitEditing={() => formRefs[1].current?.focus()}
                    ref={formRefs[0]}
                  />
                  <FormInput
                    name="confirmPassword"
                    control={control}
                    secureTextEntry
                    label="Confirme a nova senha"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    ref={formRefs[1]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={isLoading ? "hourglass-empty" : "check"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {isLoading ? "Alterando..." : "Alterar Senha"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Security Tips Card */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
    marginBottom: 20,
  },
  tipsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
    marginBottom: 20,
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
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  tipText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default ChangePasswordScreen;
