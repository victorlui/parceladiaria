import { AnalyticsService } from "@/analytics/analytics.service";
import {
  ANALYTICS_FLOWS,
  TAB_ANALYTICS_SOURCES,
  TAB_SCREENS,
} from "@/analytics/events";
import ModalTerms from "@/components/config/modal-terms";
import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { Device } from "@/interfaces/devices";
import api, { withAnalytics } from "@/services/api";
import { changePassword } from "@/services/loans";
import { useAuthStore } from "@/store/auth";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Sub-componente para o Item de Dispositivo ---
const DeviceItem = ({
  device,
  isCurrent,
  onRevoke,
}: {
  device: Device;
  isCurrent: boolean;
  onRevoke: (id: number) => void;
}) => (
  <View style={styles.deviceInnerCard}>
    <View style={styles.deviceHeader}>
      <Text style={styles.deviceName}>
        {device.user_agent === "mobile" ? "Celular" : device.user_agent}
      </Text>
      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>ATUAL</Text>
        </View>
      )}
    </View>

    <Text style={styles.deviceInfo}>IP: {device.ip_last_seen}</Text>
    <Text style={styles.deviceInfo}>Último acesso: {device.last_used_at}</Text>

    {!isCurrent && (
      <TouchableOpacity
        style={styles.revokeButton}
        onPress={() => onRevoke(device.id)}
      >
        <Feather name="x" size={16} color="#0F172A" />
        <Text style={styles.revokeButtonText}>Revogar</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ConfigTab: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);

  const [termsVisible, setTermsVisible] = useState(false);
  const [termsHtml, setTermsHtml] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);

  const { logout, user } = useAuthStore();

  const fetchDevices = useCallback(async () => {
    try {
      setLoadingDevices(true);
      const { data } = await api.get(
        "/v1/client/trusted-devices",
        withAnalytics({
          flow: ANALYTICS_FLOWS.APP,
          source: TAB_ANALYTICS_SOURCES.CONFIG_LOAD_DEVICES,
        }),
      );
      setDevices(data.data);
    } catch {
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      AnalyticsService.screen(TAB_SCREENS.CONFIG, {
        flow: ANALYTICS_FLOWS.APP,
      });
      fetchDevices();
    }, [fetchDevices]),
  );

  const handleSave = async () => {
    Keyboard.dismiss();
    if (!newPassword || !confirmPassword) {
      return Alert.alert(
        "Campos obrigatórios",
        "Informe a nova senha e a confirmação.",
      );
    }
    if (newPassword.length < 6) {
      return Alert.alert(
        "Senha inválida",
        "A senha deve ter pelo menos 6 caracteres.",
      );
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert(
        "Senhas diferentes",
        "A confirmação deve ser igual à nova senha.",
      );
    }

    try {
      setIsSaving(true);
      await changePassword(newPassword, {
        flow: ANALYTICS_FLOWS.APP,
        source: TAB_ANALYTICS_SOURCES.CONFIG_CHANGE_PASSWORD,
      });
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível alterar a senha.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeDevice = async (id: number) => {
    Alert.alert(
      "Revogar acesso",
      "Deseja realmente remover este dispositivo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Revogar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(
                `/v1/client/trusted-devices/${id}`,
                withAnalytics({
                  flow: ANALYTICS_FLOWS.APP,
                  source: TAB_ANALYTICS_SOURCES.CONFIG_REVOKE_DEVICE,
                  trusted_device_id: id,
                }),
              );
              fetchDevices();
            } catch {
              Alert.alert("Erro", "Não foi possível revogar o dispositivo.");
            }
          },
        },
      ],
    );
  };

  const openTerms = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/termos/termos_condicao",
        withAnalytics({
          flow: ANALYTICS_FLOWS.APP,
          source: TAB_ANALYTICS_SOURCES.CONFIG_LOAD_TERMS,
        }),
      );
      setTermsHtml(data.termo.content);
    } catch {
      setTermsHtml(
        "<html><body><p>Erro ao carregar os termos de uso.</p></body></html>",
      );
    } finally {
      setTermsVisible(true);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
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
          <View style={styles.inputGap} />

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
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <FontAwesome name="save" size={18} color={Colors.white} />
                <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Card de dispositivos - REFATORADO PARA O LAYOUT NOVO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dispositivos Confiáveis</Text>
          <Text style={styles.cardDescription}>
            Locais e dispositivos onde você já entrou. Revogue qualquer um que
            não reconheça.
          </Text>

          <View style={styles.deviceList}>
            {loadingDevices ? (
              <ActivityIndicator color={Colors.green.primary} />
            ) : (
              devices.map((device, index) => (
                <DeviceItem
                  key={device.id}
                  device={device}
                  isCurrent={index === 0} // Exemplo: assume que o primeiro é o atual
                  onRevoke={handleRevokeDevice}
                />
              ))
            )}
          </View>
        </View>

        {/* Card: Termos e Condições */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Termos e Condições</Text>
          <View style={styles.inputGap} />
          <TouchableOpacity
            disabled={user?.lastLoan?.blocked}
            style={[
              styles.outlineButton,
              { opacity: user?.lastLoan?.blocked ? 0.5 : 1 },
            ]}
            onPress={openTerms}
          >
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
      </ScrollView>

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
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
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
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 20,
  },
  label: { fontSize: 12, color: "#64748B" },
  inputGap: { height: 12 },

  // --- Estilos dos Dispositivos (Novo Layout) ---
  deviceList: { marginTop: 16, gap: 12 },
  deviceInnerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  deviceName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  currentBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  deviceInfo: { fontSize: 13, color: "#64748B", marginTop: 2 },
  revokeButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  revokeButtonText: { fontSize: 14, fontWeight: "600", color: "#0F172A" },

  // --- Outros Componentes ---
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: Colors.white },
  disabled: { opacity: 0.6 },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 14,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  logoutText: { fontSize: 16, fontWeight: "600", color: Colors.green.primary },
});
