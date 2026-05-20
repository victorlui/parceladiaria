import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useRegisterStore } from "@/store/register_new";
import { validateCPF } from "@/utils/validation";
import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLoginHook } from "./hooks/useLoginHook";

const LoginScreen: React.FC = () => {
  const { AlertDisplay, showWarning, showError } = useAlerts();
  const { checkCPFMutation } = useLoginHook();
  const { setData } = useRegisterStore();
  const cpfRef = useRef<TextInput>(null);
  const [cpf, setCpf] = useState("");

  const onSubmit = () => {
    Keyboard.dismiss();
    if (!cpf) {
      showWarning("Atenção", "Preencha todos os campos");
      return;
    }

    if (!validateCPF(cpf)) {
      showError("Atenção", "CPF inválido");
      return;
    }
    setData({ cpf });
    setCpf(cpf);
    checkCPFMutation.mutate({
      cpf,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AlertDisplay />
      <KeyboardAvoidingView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo-verde.png")}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
        <Text style={styles.title}>Parcela Diária</Text>
        <Text style={styles.subtitle}>Insira seu CPF para continuar</Text>

        <View style={styles.formContainer}>
          <InputComponent
            ref={cpfRef}
            placeholder="Seu CPF"
            keyboardType="numeric"
            maxLength={11}
            value={cpf}
            maskType="cpf"
            icon={
              <FontAwesome name="vcard" size={20} color={Colors.gray.primary} />
            }
            onChangeText={setCpf}
            returnKeyType="send"
            onSubmitEditing={onSubmit}
          />
        </View>
        <View style={styles.footerContainer}>
          <ButtonComponent
            title="Acessar"
            onPress={onSubmit}
            loading={checkCPFMutation.isPending}
            iconLeft={null}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
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

export default LoginScreen;
