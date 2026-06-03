import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function CPFScreen() {
  const { showWarning } = useAlerts();
  const { setCpfValid } = useAuthStore((state) => state);
  const cpfRef = useRef<TextInput>(null);
  const [cpf, setCpf] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (cpf.length !== 11) {
      showWarning("Atenção", "CPF inválido");
      return;
    }
    cpfRef.current?.blur();
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/recovery/start", {
        cpf,
      });
      console.log("data", data);

      setCpfValid(cpf);

      if (data.data.method && data.data.method === "question") {
        router.push("/(recovery)/birthdate");
        return;
      }
      if (data.data.method && data.data.method === "face") {
        router.push("/(recovery)/face");
        return;
      }

      router.push("/(recovery)/otp");
      return;
    } catch (error: any) {
      if (error.response?.data?.message === "Validation Error.") {
        showWarning("Error", "CPF inválido");
        return;
      }
      showWarning(
        "Erro",
        error.response?.data?.message ||
          "Ocorreu um erro ao verificar seu CPF.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require("@/assets/images/logo-verde.png")}
              resizeMode="cover"
              style={styles.logo}
            />
            <View style={styles.content}>
              <Text style={styles.title}>Parcela Diária</Text>
              <Text style={styles.subtitle}>
                Digite seu CPF para recuperar a senha
              </Text>
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
                returnKeyType="send"
                onSubmitEditing={() => onSubmit()}
              />
            </View>
            <ButtonComponent
              title="Continuar"
              onPress={onSubmit}
              iconLeft={null}
              iconRight={null}
              disabled={cpf.length !== 11}
              loading={isLoading}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  logo: {
    width: 100,
    height: 100,
  },
  content: {
    width: "100%",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.green.primary,
    marginBottom: 10,
    textAlign: "center",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.text,
    textAlign: "center",
    marginBottom: 24,
  },
});
