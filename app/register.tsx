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
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import LogoComponent from "@/components/ui/Logo";
// import { useEffect, useRef } from "react";

export default function RegisterScreen() {
  const { handleSubmit, control } = useCPFForm();
  const { AlertDisplay } = useAlerts();
  const { mutate, isPending } = useCheckCPFMutation();
  const { setCpf } = useRegisterAuthStore();
  //   const hasShownWarning = useRef(false);

  //   useEffect(() => {
  //     if (isSuccess && !hasShownWarning.current) {
  //       hasShownWarning.current = true;
  //       showWarning("Atenção", "CPF já está cadastrado. Faça o login. ");
  //     }
  //     if (!isSuccess) {
  //       hasShownWarning.current = false;
  //     }
  //   }, [isSuccess, showWarning]);

  const onSubmit = (data: CPFSchema) => {
    Keyboard.dismiss();
    setCpf(data.cpf);
    mutate(data);
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
              <LogoComponent />

              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Bem-vindo</Text>
                <Text style={styles.welcomeSubtitle}>
                  Informe seu CPF para continuar
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

  welcomeCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#053D39",
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
    backgroundColor: "#053D39",
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
