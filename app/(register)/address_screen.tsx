import { FormInput } from "@/components/FormInput";
import { useAddressForm } from "@/hooks/useRegisterForm";
import { AddressSchema } from "@/lib/address_validation";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
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

  // Refs para navegação entre inputs
  const ruaRef = useRef<TextInput>(null);
  const numeroRef = useRef<TextInput>(null);
  const bairroRef = useRef<TextInput>(null);
  const estadoRef = useRef<TextInput>(null);
  const cidadeRef = useRef<TextInput>(null);

  // Função de busca de CEP
  const fetchAddressData = useCallback(
    async (cleanCep: string) => {
      if (cleanCep.length !== 8) return;
      try {
        setLoading(true);
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();

        if (data.erro) {
          showWarning("Atenção", "CEP não encontrado. Tente novamente.");
          return;
        }

        setValue("rua", data.logradouro || "");
        setValue("bairro", data.bairro || "");
        setValue("cidade", data.localidade || "");
        setValue("estado", data.uf || "");

        // Foca automaticamente no campo número
        numeroRef.current?.focus();
      } catch {
        showWarning(
          "Erro",
          "Não foi possível buscar o CEP. Verifique sua conexão."
        );
      } finally {
        setLoading(false);
      }
    },
    [setValue, showWarning]
  );

  // Debounce da busca automática do CEP
  useEffect(() => {
    const cleanCep = cep?.replace(/\D/g, "");
    if (!cleanCep || cleanCep.length < 8) return;
    const timeout = setTimeout(() => fetchAddressData(cleanCep), 300);
    return () => clearTimeout(timeout);
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

    mutate({ request });
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
                {/* Header */}
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
                      color="#053D39"
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
                      returnKeyType="next"
                      onSubmitEditing={() => ruaRef.current?.focus()}
                    />

                    {loading && (
                      <View style={styles.loadingBox}>
                        <ActivityIndicator color={Colors.green.primary} />
                        <Text style={styles.loadingText}>Buscando CEP...</Text>
                      </View>
                    )}

                    <FormInput
                      control={control}
                      label="Rua"
                      placeholder="Informe sua Rua"
                      name="rua"
                      ref={ruaRef}
                      onSubmitEditing={() => numeroRef.current?.focus()}
                    />
                    <FormInput
                      control={control}
                      label="Número"
                      placeholder="Informe seu Número"
                      name="numero"
                      ref={numeroRef}
                      onSubmitEditing={() => bairroRef.current?.focus()}
                    />
                    <FormInput
                      control={control}
                      label="Bairro"
                      placeholder="Informe seu Bairro"
                      name="bairro"
                      ref={bairroRef}
                      onSubmitEditing={() => estadoRef.current?.focus()}
                    />
                    <FormInput
                      control={control}
                      label="Estado"
                      placeholder="Informe seu Estado"
                      name="estado"
                      ref={estadoRef}
                      onSubmitEditing={() => cidadeRef.current?.focus()}
                    />
                    <FormInput
                      control={control}
                      label="Cidade"
                      placeholder="Informe sua Cidade"
                      name="cidade"
                      ref={cidadeRef}
                      onSubmitEditing={() => Keyboard.dismiss()}
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
                    {loading || isPending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons
                          name="arrow-forward"
                          size={20}
                          color="#fff"
                        />
                        <Text style={styles.buttonText}>Continuar</Text>
                      </>
                    )}
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
  container: { flex: 1, backgroundColor: Colors.dark.background },
  gradientBackground: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: { padding: 20 },
  header: { flexDirection: "row", marginBottom: 10 },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
    alignItems: "center",
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
  },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  inputContainer: { marginBottom: 20 },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#053D39",
    borderRadius: 12,
    paddingVertical: 16,
  },
  buttonDisabled: { backgroundColor: "#9CA3AF" },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  loadingText: { color: "#6B7280", fontSize: 14 },
});
