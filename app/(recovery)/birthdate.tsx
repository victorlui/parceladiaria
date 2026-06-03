import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useQuestionsStore } from "@/store/questions";
import { validateBirthDate18Plus } from "@/utils/validation";
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

export default function BirthdateScreen() {
  const { showWarning } = useAlerts();
  const { cpfValid } = useAuthStore((state) => state);
  const { setData } = useQuestionsStore((state) => state);
  const birthDateRef = useRef<TextInput>(null);
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    setIsLoading(true);
    Keyboard.dismiss();
    try {
      const formattedBirthDate = birthDate
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d{2})(\d{4})$/, "$1/$2/$3");
      const { data } = await api.post("/auth/recovery/confirm-birthdate", {
        nascimento: formattedBirthDate,
        cpf: cpfValid,
      });

      setData(data.data);
      router.push("/(recovery)/questions");
    } catch (error: any) {
      console.log("error", error.response.data);
      showWarning("Atenção", error.response.data.message || error.message);
      return;
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
                ref={birthDateRef}
                placeholder="dd/mm/aaaa"
                keyboardType="numeric"
                maxLength={10}
                value={birthDate}
                maskType="date"
                icon={
                  <FontAwesome
                    name="calendar"
                    size={20}
                    color={Colors.gray.primary}
                  />
                }
                onChangeText={setBirthDate}
                returnKeyType="done"
                error={
                  birthDate && !validateBirthDate18Plus(birthDate)
                    ? "Data de nascimento inválida"
                    : ""
                }
                onSubmitEditing={onSubmit}
              />
            </View>
            <ButtonComponent
              title="Continuar"
              onPress={onSubmit}
              iconLeft={null}
              iconRight={null}
              disabled={!birthDate || !validateBirthDate18Plus(birthDate)}
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
