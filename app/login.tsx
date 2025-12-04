import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
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
import InputComponent from "@/components/ui/Input";
import { FontAwesome } from "@expo/vector-icons";
import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { validateCPF } from "@/utils/validation";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { router } from "expo-router";
import * as Updates from "expo-updates";

const Login: React.FC = () => {
  const { AlertDisplay, showWarning, showError } = useAlerts();
  const { mutate, isPending, isError } = useLoginMutation();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const cpfRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const hasShownError = useRef(false);

  useEffect(() => {
    async function checkUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Atualização disponível",
            "O app será reiniciado para aplicar as novas alterações.",
            [
              {
                text: "OK",
                onPress: () => Updates.reloadAsync(),
              },
            ]
          );
        }
      } catch (e) {
        console.log("Erro ao buscar update", e);
      }
    }

    checkUpdate();
  }, []);

  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true;
      showError("Atenção", "Login ou senha inválida.");
    }
    if (!isError) {
      hasShownError.current = false;
    }
  }, [isError, showError]);

  const onSubmit = () => {
    Keyboard.dismiss();
    if (!cpf || !password) {
      showWarning("Atenção", "Preencha todos os campos");
      return;
    }

    const isValid = validateCPF(cpf);
    if (isValid !== "") {
      showError("Atenção", "CPF inválido");
      return;
    }

    mutate({
      cpf,
      password,
    });
  };

  const navigationForgotPassword = () => {
    router.push("/(auth)/cpf-otp-screen");
  };

  const navigationRegister = () => {
    router.push("/(register_new)/register-cpf");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AlertDisplay />
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
            <Text style={styles.subtitle}>
              Insira seu CPF e sua senha para continuar
            </Text>

            <View style={styles.formContainer}>
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
                returnKeyType="next"
                onSubmitEditing={() => senhaRef.current?.focus()}
              />
              <InputComponent
                ref={senhaRef}
                placeholder="Senha"
                secureTextEntry
                value={password}
                icon={
                  <FontAwesome
                    name="lock"
                    size={22}
                    color={Colors.gray.primary}
                  />
                }
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
            </View>
            <View style={styles.footerContainer}>
              <ButtonComponent
                title="Acessar"
                onPress={onSubmit}
                loading={isPending}
                iconLeft={null}
              />
              <TouchableOpacity
                onPress={navigationForgotPassword}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 3,
                }}
              >
                <Text style={{ fontSize: 16, color: Colors.gray.text }}>
                  Não tem uma conta?{" "}
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
                    Registre-se
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
});

export default Login;
