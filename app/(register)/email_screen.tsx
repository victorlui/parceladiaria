import {
  Image,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useEmailForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { EmailSchema } from "@/lib/email_validation";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRegisterAuthStore } from "@/store/register";
import LogoComponent from "@/components/ui/Logo";

export default function EmailScreen() {
  const { control, handleSubmit } = useEmailForm();
  const { setEmail } = useRegisterAuthStore();
  const { mutate, isPending } = useUpdateUserMutation();

  const onSubmit = (data: EmailSchema) => {
    const request = {
      email: data.email,
      etapa: Etapas.REGISTRANDO_ENDERECO,
    };
    setEmail(data.email!);
    mutate({ request: request });
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
              {/* Header com botão voltar */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <LogoComponent logoWithText={false} width={240} />

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Insira seu email</Text>
                <Text style={styles.welcomeSubtitle}>
                  Precisamos do seu e-mail para enviar informações importantes
                </Text>
              </View>

              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="email"
                    size={20}
                    color="#9BD13D"
                  />
                  <Text style={styles.cardTitle}>E-mail</Text>
                </View>

                <View style={styles.inputContainer}>
                  <FormInput
                    control={control}
                    label="E-mail"
                    name="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
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
                    {isPending ? "Salvando..." : "Continuar"}
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
    marginBottom: 10,
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
