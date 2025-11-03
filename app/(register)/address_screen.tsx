import { FormInput } from "@/components/FormInput";
import { useAddressForm } from "@/hooks/useRegisterForm";
import { AddressSchema } from "@/lib/address_validation";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Image,
  Keyboard,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRegisterAuthStore } from "@/store/register";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { useAlerts } from "@/components/useAlert";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoComponent from "@/components/ui/Logo";

export default function AddressScreen() {
  const { showWarning, AlertDisplay } = useAlerts();
  const { setAddress } = useRegisterAuthStore();
  const { control, handleSubmit, setValue, watch } = useAddressForm();
  const { mutate, isPending } = useUpdateUserMutation();
  const [loading, setLoading] = useState(false);
  const cep = watch("cep");

  // Ajuste aqui: agora temos um useRef para cada campo
  const formRefs = [
    useRef<TextInput>(null), // Para o CEP (index 0)
    useRef<TextInput>(null), // Para a Rua (index 1)
    useRef<TextInput>(null), // Para o Número (index 2)
    useRef<TextInput>(null), // Para o Bairro (index 3)
    useRef<TextInput>(null), // Para o Estado (index 4)
    useRef<TextInput>(null), // Para a Cidade (index 5)
  ];

  const fetchAddressData = useCallback(
    async (cleanCep: string) => {
      setLoading(true);
      Keyboard.dismiss();
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanCep}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          setValue("rua", data.logradouro || "");
          setValue("bairro", data.bairro || "");
          setValue("cidade", data.localidade || "");
          setValue("estado", data.uf || "");
        } else {
          showWarning("Atenção", "CEP não encontrado. Tente novamente");
        }
      } catch (error) {
        // lidar com erro se quiser
      } finally {
        setLoading(false);
      }
    },
    [setValue, showWarning]
  );

  useEffect(() => {
    const cleanCep = cep?.replace(/\D/g, "");
    if (cleanCep && cleanCep.length === 8) {
      fetchAddressData(cleanCep);
    }
  }, [cep, fetchAddressData]);

  const onSubmit = (data: AddressSchema) => {
    setAddress(data);
    const request = {
      cep: data.cep,
      endereco: data.rua,
      numero: data.numero,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      complemento: data.complemento,
      etapa: Etapas.REGISTRANDO_COMPROVANTE_ENDERECO,
    };

    mutate({ request: request });
    //router.push('/(register)/address_document')
  };

  return (
    <>
      <AlertDisplay />
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
                    <MaterialIcons
                      name="arrow-back"
                      size={24}
                      color="#1F2937"
                    />
                  </TouchableOpacity>
                </View>

                <LogoComponent logoWithText={false} width={240} />

                <View style={styles.welcomeCard}>
                  <Text style={styles.welcomeTitle}>Informe seu endereço</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Preencha todos os campos obrigatórios
                  </Text>
                </View>

                <View style={styles.inputCard}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={20}
                      color="#9BD13D"
                    />
                    <Text style={styles.cardTitle}>Endereço</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <FormInput
                      control={control}
                      label="CEP"
                      placeholder="Informe seu CEP"
                      name="cep"
                      maskType="custom"
                      maskOptions={{ mask: "99999-999" }}
                      onSubmitEditing={() => formRefs[1].current?.focus()}
                      ref={formRefs[0]}
                    />
                    <FormInput
                      control={control}
                      label="Rua"
                      placeholder="Informe sua Rua"
                      name="rua"
                      onSubmitEditing={() => formRefs[2].current?.focus()}
                      ref={formRefs[1]}
                    />
                    <FormInput
                      control={control}
                      label="Número"
                      placeholder="Informe seu Número"
                      name="numero"
                      onSubmitEditing={() => formRefs[3].current?.focus()}
                      ref={formRefs[2]}
                    />
                    <FormInput
                      control={control}
                      label="Bairro"
                      placeholder="Informe seu Bairro"
                      name="bairro"
                      onSubmitEditing={() => formRefs[4].current?.focus()}
                      ref={formRefs[3]}
                    />
                    <FormInput
                      control={control}
                      label="Estado"
                      placeholder="Informe seu Estado"
                      name="estado"
                      onSubmitEditing={() => formRefs[5].current?.focus()}
                      ref={formRefs[4]}
                    />
                    <FormInput
                      control={control}
                      label="Cidade"
                      placeholder="Informe sua Cidade"
                      name="cidade"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      ref={formRefs[5]}
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.continueButton,
                      (loading || isPending) && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading || isPending}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={
                        loading || isPending
                          ? "hourglass-empty"
                          : "arrow-forward"
                      }
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.buttonText}>
                      {loading || isPending ? "Processando..." : "Continuar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </>
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
