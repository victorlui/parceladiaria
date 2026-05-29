import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useRegisterStore } from "@/store/register_new";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoginHook } from "./hooks/useLoginHook";

const InsertPasswordScreen: React.FC = () => {
  const { AlertDisplay, showWarning, showError } = useAlerts();
  const { loginMutation } = useLoginHook();
  const { data, setData } = useRegisterStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const senhaRef = useRef<TextInput>(null);
  const hasShownError = useRef(false);

  useEffect(() => {
    if (!loginMutation.error) {
      hasShownError.current = false;
    }
  }, [loginMutation.error, showError]); //eslint-disable-line

  const onSubmit = async () => {
    Keyboard.dismiss();

    if (!password) {
      showWarning("Atenção", "Preencha todos os campos");
      return;
    }

    try {
      const cleanPassword = password.trim();
      const rawCpf = (data?.cpf ?? "").replace(/\D/g, "");

      loginMutation.mutate({
        cpf: rawCpf,
        password: cleanPassword,
      });
    } catch {
      showWarning("Atenção", "CPF inválido");
      return;
    }
  };

  const navigationForgotPassword = () => {
    router.push("/(auth)/validity");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AlertDisplay />
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        animated={true}
      />

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

          <Text style={styles.title}>Senha de acesso</Text>
          <Text style={styles.subtitle}>
            Digite sua senha para acessar sua conta
          </Text>

          <View style={styles.formContainer}>
            <InputComponent
              ref={senhaRef}
              placeholder="Senha"
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
                  onPress={() => {
                    setShowPassword(!showPassword);
                  }}
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
              loading={loginMutation.isPending}
              iconLeft={null}
            />
            <TouchableOpacity
              onPress={navigationForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
            {/* <View
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
              </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

export default InsertPasswordScreen;
