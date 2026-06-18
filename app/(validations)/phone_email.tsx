import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import ModalOTP from "@/components/ui/ModalOTP";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { validateEmail } from "@/utils/validation";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhoneEmail() {
  const { type, title } = useLocalSearchParams();
  const { showSuccess, showError } = useAlerts();
  const { setUser, user } = useAuthStore();

  const typeValue = useMemo(() => {
    const v = Array.isArray(type) ? type[0] : type;
    return v === "email" ? "email" : "phone";
  }, [type]);

  const titleValue = useMemo(() => {
    const v = Array.isArray(title) ? title[0] : title;
    if (v?.trim()) return v;
    return typeValue === "email" ? "Alterar email" : "Alterar telefone";
  }, [title, typeValue]);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<
    "perdi_chip" | "mudei_operadora" | "cadastro_errado" | "outro" | ""
  >("");
  const [isSending, setIsSending] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);

  const emailError = useMemo(() => {
    if (!email) return "";
    return validateEmail(email) ? "" : "Email inválido";
  }, [email]);

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const phoneError = useMemo(() => {
    if (!phoneDigits) return "";
    return phoneDigits.length === 11 ? "" : "Celular inválido";
  }, [phoneDigits]);

  const canSend = useMemo(() => {
    if (typeValue === "email") return !!email && !emailError;
    return phoneDigits.length === 11 && !phoneError && !!reason;
  }, [email, emailError, phoneDigits.length, phoneError, reason, typeValue]);

  const handleCancel = () => {
    Keyboard.dismiss();
    router.back();
  };

  const handleSendCode = async () => {
    Keyboard.dismiss();
    if (isSending || !canSend) return;
    setIsSending(true);
    try {
      const request =
        typeValue === "email" ? { email } : { telefone: phone, motivo: reason };
      await api.post(`/v1/client/change/${typeValue}/otp`, request);
      setOtpVisible(true);
    } catch (error: any) {
      showError(
        "Atenção",
        error.response?.data?.message || "Erro ao enviar código",
      );
    } finally {
      setIsSending(false);
    }
  };

  const confirmarOTP = async (otp: string) => {
    try {
      const { data } = await api.put(`/v1/client/change/${typeValue}/confirm`, {
        otp,
      });

      showSuccess(
        "Successo",
        `${typeValue === "email" ? "Email" : "Telefone"} alterado com sucesso`,
        () => {
          setUser({
            ...user,
            ...(typeValue === "email"
              ? { email, email_verificado: true }
              : { phone, phone_verificado: true }),
          });
          router.back();
        },
      );
    } catch {
      return;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ModalOTP
        visible={otpVisible}
        onClose={() => setOtpVisible(false)}
        onSubmit={confirmarOTP}
        onResendCode={handleSendCode}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back-sharp"
                size={26}
                color={Colors.black}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              {titleValue}
            </Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {typeValue === "email" ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Novo email</Text>
                <Text style={styles.sectionSubtitle}>
                  Digite seu email para receber um código de confirmação.
                </Text>

                <InputComponent
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seuemail@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                  icon={
                    <MaterialIcons
                      name="email"
                      size={18}
                      color={Colors.gray.primary}
                    />
                  }
                />
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Novo telefone</Text>
                <Text style={styles.sectionSubtitle}>
                  Digite seu celular e selecione o motivo da alteração.
                </Text>

                <InputComponent
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maskType="cellphone"
                  error={phoneError}
                  returnKeyType="done"
                  icon={
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color={Colors.gray.primary}
                    />
                  }
                />

                <View style={styles.reasonSection}>
                  <Text style={styles.reasonTitle}>Motivo</Text>

                  <View style={styles.reasonList}>
                    {(
                      [
                        { label: "Perdi Chip", value: "perdi_chip" },
                        {
                          label: "Mudei de operadora",
                          value: "mudei_operadora",
                        },
                        { label: "Cadastro errado", value: "cadastro_errado" },
                        { label: "Outro", value: "outro" },
                      ] as const
                    ).map((item) => {
                      const selected = reason === item.value;
                      return (
                        <Pressable
                          key={item.value}
                          onPress={() => setReason(item.value)}
                          style={[
                            styles.reasonItem,
                            selected && styles.reasonItemSelected,
                          ]}
                        >
                          <View
                            style={[
                              styles.radioOuter,
                              selected && styles.radioOuterSelected,
                            ]}
                          >
                            {selected ? (
                              <View style={styles.radioInner} />
                            ) : null}
                          </View>
                          <Text
                            style={[
                              styles.reasonText,
                              selected && styles.reasonTextSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerButtons}>
              <View style={styles.footerButton}>
                <ButtonComponent
                  title="Cancelar"
                  onPress={handleCancel}
                  outline
                  iconLeft={null}
                  iconRight={null}
                />
              </View>
              <View style={styles.footerButton}>
                <ButtonComponent
                  title="Enviar código"
                  onPress={handleSendCode}
                  disabled={!canSend || isSending}
                  loading={isSending}
                  iconLeft={null}
                  iconRight={null}
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EAF3F2",
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.gray.text,
    lineHeight: 18,
  },
  reasonSection: {
    marginTop: 4,
    gap: 10,
  },
  reasonTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  reasonList: {
    gap: 10,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  reasonItemSelected: {
    borderColor: Colors.green.primary,
    backgroundColor: "#F2FBF9",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.gray.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.green.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: Colors.green.primary,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  reasonTextSelected: {
    color: Colors.green.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#EAF3F2",
    backgroundColor: Colors.white,
  },
  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
