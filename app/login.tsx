import { FormInput } from "@/components/FormInput";
import { useCPFForm } from "@/hooks/useLoginForm";
import { useCheckCPFMutation } from "@/hooks/useLoginMutation";
import { CPFSchema } from "@/lib/cpf_validation";
import { useRegisterAuthStore } from "@/store/register";
import {
  Image,
  Keyboard,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAlerts } from "@/components/useAlert";
import { FontAwesome, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
export default function LoginScreen() {
  const { handleSubmit, control } = useCPFForm();
  const { AlertDisplay } = useAlerts();
  const mutation = useCheckCPFMutation();
  const { setCpf } = useRegisterAuthStore();

  const onSubmit = (data: CPFSchema) => {
    Keyboard.dismiss();
    setCpf(data.cpf);
    mutation.mutate(data);
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
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/images/apenas-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.welcomeCard}>
                {/* <View style={styles.iconContainer}>
                  <FontAwesome6 name="lock" size={40} color="white" />
                </View> */}

                <Text style={styles.welcomeTitle}>Bem-vindo</Text>
                <Text style={styles.welcomeSubtitle}>
                  Faça login com seu CPF para acessar sua conta
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
                    onSubmitEditing={handleSubmit(onSubmit)}
                    icon={
                      <FontAwesome name="id-card" size={24} color="#9CA3AF" />
                    }
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    mutation.isPending && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={mutation.isPending}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={mutation.isPending ? "hourglass-empty" : "login"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.buttonText}>
                    {mutation.isPending ? "Verificando..." : "Continuar"}
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
});
