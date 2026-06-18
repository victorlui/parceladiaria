import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChangePassword: React.FC = () => {
  const { showSuccess, showError, hideAlert } = useAlerts();
  const { tokenRegister } = useAuthStore();
  const { token } = useRegisterStore();
  const senhaRef = useRef<TextInput>(null);
  const confirmSenhaRef = useRef<TextInput>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validações em tempo real da senha
  const passwordChecks = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Pelo menos 1 letra", valid: /[A-Za-z]/.test(password) },
    { label: "Pelo menos 1 número", valid: /\d/.test(password) },
    {
      label: "Pelo menos 1 símbolo (!@#$%&*)",
      valid: /[!@#$%&*]/.test(password),
    },
  ];
  const onSubmit = async () => {
    if (!password || !confirmPassword) {
      showError("Erro", "Por favor, digite a nova senha e confirme-a.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Erro", "As senhas não coincidem.");
      return;
    }

    // Validação da senha
    const passwordValid = passwordChecks.every((check) => check.valid);
    if (!passwordValid) {
      showError(
        "Erro",
        "A senha não atende aos requisitos de segurança. Por favor, tente novamente.",
      );
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    const recoveryToken = tokenRegister ?? token;

    if (!recoveryToken) {
      showError("Erro", "Sessão de recuperação inválida. Reinicie o processo.");
      setIsLoading(false);
      return;
    }

    try {
      await api.post(
        "/v1/client/change-password",
        {
          password: password,
        },
        {
          headers: {
            Authorization: `Bearer ${recoveryToken}`,
          },
        },
      );

      showSuccess("Sucesso", "Senha alterada com sucesso!", () => {
        hideAlert();
        router.replace("/login");
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        showError("Erro", error.message);
      } else {
        showError("Erro", "Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigationRegister = () => {
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        animated={true}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            <Text style={styles.subtitle}>Crie uma nova senha de acesso.</Text>

            <View style={styles.formContainer}>
              <InputComponent
                ref={senhaRef}
                placeholder="Nova senha"
                secureTextEntry={!showPassword}
                value={password}
                icon={
                  <FontAwesome
                    name="lock"
                    size={22}
                    color={Colors.gray.primary}
                  />
                }
                rightIcon={
                  <FontAwesome
                    name={showPassword ? "eye-slash" : "eye"}
                    size={22}
                    color={Colors.gray.primary}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                onChangeText={setPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmSenhaRef.current?.focus()}
              />
              <InputComponent
                ref={confirmSenhaRef}
                placeholder="Confirme a senha"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                icon={
                  <FontAwesome
                    name="lock"
                    size={22}
                    color={Colors.gray.primary}
                  />
                }
                rightIcon={
                  <FontAwesome
                    name={showConfirmPassword ? "eye-slash" : "eye"}
                    size={22}
                    color={Colors.gray.primary}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />

              {/* Validações da senha */}
              <View style={styles.validationContainer}>
                {passwordChecks.map((item, idx) => (
                  <View key={idx} style={styles.validationRow}>
                    <FontAwesome
                      name={item.valid ? "check-circle" : "circle"}
                      size={16}
                      color={
                        item.valid ? Colors.green.primary : Colors.gray.primary
                      }
                    />
                    <Text
                      style={[
                        styles.validationText,
                        {
                          color: item.valid
                            ? Colors.green.primary
                            : Colors.gray.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.footerContainer}>
              <ButtonComponent
                title="Redefinir"
                onPress={onSubmit}
                loading={isLoading}
                iconLeft={null}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 3,
                }}
              >
                <Text style={{ fontSize: 16, color: Colors.gray.text }}>
                  Já tem uma conta?
                </Text>
                <TouchableOpacity onPress={navigationRegister}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: Colors.green.primary,
                      fontWeight: "bold",
                      textDecorationLine: "underline",
                    }}
                  >
                    Acessar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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

  // Estilos da validação
  validationContainer: {
    width: "100%",
    marginTop: 8,
    gap: 8,
  },
  validationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  validationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  validationText: {
    fontSize: 14,
    color: Colors.gray.text,
  },
});

export default ChangePassword;
