import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CPFOTPScreen: React.FC = () => {
  const { AlertDisplay, showWarning, showError } = useAlerts();
  const cpfRef = useRef<TextInput>(null);
  const hasShownError = useRef(false);
  const [cpf, setCpf] = useState("414.906.718-03");
  // 414.906.718-03
  // 40913814806

  const onSubmit = async () => {
    if (!cpf) {
      showError("Atenção", "CPF obrigatório");
      return;
    }

    if (!cpf) {
      showError("Atenção", "CPF inválido");
      return;
    }

    try {
      const response = await api.post("/auth/otp", {
        cpf,
        method: "meta",
      });
      console.log(response.data);
    } catch (error) {
      console.log(error.response);
      showError("Atenção", "Erro ao enviar código verifique o CPF");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AlertDisplay />
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
            Digite seu CPF para recuperar a senha
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
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          </View>
          <View style={styles.footerContainer}>
            <ButtonComponent title="Enviar Código" onPress={onSubmit} />
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

export default CPFOTPScreen;
