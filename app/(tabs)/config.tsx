import React, { useState, useCallback } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import ModalTerms from "@/components/config/modal-terms";
import { Asset } from "expo-asset";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { changePassword } from "@/services/loans";
import * as FileSystem from "expo-file-system";

const ConfigTab: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [termsVisible, setTermsVisible] = useState(false);
  const [termsHtml, setTermsHtml] = useState("");

  const { logout } = useAuthStore();

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!newPassword || !confirmPassword) {
      Alert.alert(
        "Campos obrigatórios",
        "Informe a nova senha e a confirmação."
      );
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(
        "Senha inválida",
        "A senha deve ter pelo menos 6 caracteres."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Senhas diferentes",
        "A confirmação deve ser igual à nova senha."
      );
      return;
    }

    try {
      setIsSaving(true);
      await changePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível alterar a senha."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openTerms = useCallback(async () => {
    try {
      const asset = Asset.fromModule(require("@/assets/termodeuso_app.html"));
      await asset.downloadAsync();
      const fileUri = asset.localUri || asset.uri;
      if (!fileUri) throw new Error("URI inválida para Termos de Uso.");

      const response = await fetch(fileUri);
      const html = await response.text();

      const css = `
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; font-size:16px; line-height:1.5; padding:16px; margin:0; color:#333; background:#fff; }
          h1,h2,h3 { font-weight:600; color:#111; margin:20px 0 10px; }
          p,li { font-size:16px; margin-bottom:10px; text-align:justify; }
          ul,ol { padding-left:20px; }
          strong { font-weight:600; color:#111; }
        </style>
      `;
      setTermsHtml(`<html><head>${css}</head><body>${html}</body></html>`);
      setTermsVisible(true);
    } catch (err) {
      setTermsHtml(
        "<html><body><p>Erro ao carregar os termos de uso.</p></body></html>"
      );
      setTermsVisible(true);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            name="settings-outline"
            size={28}
            color={Colors.green.primary}
          />
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        {/* Card: Alterar Senha */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alterar Senha</Text>
          <View style={{ height: 8 }} />

          <Text style={styles.label}>Nova Senha</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            placeholder="Digite a nova senha"
            secureTextEntry
          />

          <Text style={[styles.label, { marginTop: 12 }]}>
            Confirmar Nova Senha
          </Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            placeholder="Confirme a nova senha"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryButton, isSaving && styles.disabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <FontAwesome name="save" size={18} color={Colors.white} />
            <Text style={styles.primaryButtonText}>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card: Termos e Condições */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Termos e Condições</Text>
          <View style={{ height: 8 }} />

          <TouchableOpacity style={styles.outlineButton} onPress={openTerms}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={Colors.green.primary}
            />
            <Text style={styles.outlineButtonText}>Ver Termos de Uso</Text>
          </TouchableOpacity>
        </View>

        {/* Botão: Sair da Conta */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={18}
            color={Colors.green.primary}
          />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Termos */}
      <ModalTerms
        visible={termsVisible}
        onClose={() => setTermsVisible(false)}
        title="Termos de Uso"
        htmlContent={termsHtml}
      />
    </SafeAreaView>
  );
};

export default ConfigTab;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 16, gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 15,
  },
  headerTitle: { fontSize: 25, fontWeight: "700", color: "#0F172A" },

  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#F6FBFB",
    borderWidth: 1,
    borderColor: "#E3F2F2",
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  label: { fontSize: 12, color: "#64748B" },

  input: {
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
    marginTop: 6,
  },

  primaryButton: {
    marginTop: 16,
    backgroundColor: Colors.green.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: Colors.white },
  disabled: { opacity: 0.6 },

  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  outlineButtonText: { fontSize: 16, fontWeight: "600", color: "#0F172A" },

  logoutButton: {
    borderWidth: 1,
    borderColor: Colors.green.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: Colors.green.primary },
});
