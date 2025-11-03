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
import { useRegisterAuthStore } from "@/store/register";
import { useRegisterDataMutation } from "@/hooks/useRegisterMutation";
import { useRef } from "react";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import LogoComponent from "@/components/ui/Logo";

export default function CreatePassword() {
  const { control, handleSubmit } = usePasswordsForm();
  const { phone, cpf, setPassword } = useRegisterAuthStore();
  const { mutate, isPending } = useRegisterDataMutation();
  const formRefs = [useRef<TextInput>(null), useRef<TextInput>(null)];

  const onSubmit = (data: PasswordsSchema) => {
    Keyboard.dismiss();
    setPassword(data.password || "");
    mutate({ cpf: cpf ?? "", phone: phone ?? "", password: data.password! });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

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
              <LogoComponent logoWithText={false} width={140} />

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Crie sua senha</Text>
                <Text style={styles.welcomeSubtitle}>
                  Defina uma senha segura para proteger sua conta
                </Text>
              </View>

              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <FontAwesome6 name="lock" size={20} color="#9BD13D" />
                  <Text style={styles.cardTitle}>Senha de Acesso</Text>
                </View>

                <View style={styles.inputContainer}>
                  <FormInput
                    name="password"
                    control={control}
                    secureTextEntry
                    label="Senha"
                    onSubmitEditing={() => formRefs[1].current?.focus()}
                    ref={formRefs[0]}
                  />
                  <FormInput
                    name="confirmPassword"
                    control={control}
                    secureTextEntry
                    label="Confirme a senha"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    ref={formRefs[1]}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    isPending && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isPending}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={isPending ? "hourglass-empty" : "arrow-forward"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {isPending ? "Criando..." : "Continuar"}
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
});
