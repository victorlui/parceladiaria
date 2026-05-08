import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { ChangePixModal } from "./components/ChabgePixModal";
import { router } from "expo-router";
import { useConfirmPixStore } from "@/store/confirm-pix";
import { formatCurrency } from "@/utils/formats";
import { useAuthStore } from "@/store/auth";
import * as Network from "expo-network";
import { convertData } from "@/utils";
import { tratarEstado } from "@/utils/validation";
import { useQueryDataClient } from "@/hooks/useQueryClient";
import { useAlerts } from "@/components/useAlert";
import api from "@/services/api";

const ConfirmRenewal: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { showSuccess, showError, AlertDisplay } = useAlerts();
  const { data } = useConfirmPixStore();
  const { user, setUser } = useAuthStore();
  const { refetch } = useQueryDataClient();

  const [pixCorrect, setPixCorrect] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePix = (type: string, key: string) => {
    setPixCorrect(false); // Reseta o check de confirmação para obrigar o usuário a validar a nova chave

    if (user) {
      setUser({
        ...user,
        pix: key,
      });
    }
  };

  const handleConfirm = async () => {
    if (!pixCorrect) {
      return;
    }
    setIsLoading(true);
    try {
      if (data?.isLoan) {
        const ip = await Network.getIpAddressAsync();

        const request = {
          id: data?.id,
          sign_info_date: convertData(),
          sign_info_ip_address: ip,
          sign_info_city: user?.cidade ?? "São Paulo",
          sign_info_state: tratarEstado(user?.estado || "SP"),
          sign_info_country: "BR",
        };

        await api.post("/v1/renew", request);
        refetch();
        showSuccess("Sucesso", "Renovação concluída com sucesso!");
        router.replace("/(tabs)/home");
        return;
      } else {
        const { data } = await api.post("/v1/affiliate/withdraw");
        console.log("saque indicação", data);
        if (data.success && data.data) {
          showSuccess("Sucesso", "Saque efetuado com sucesso!");
          router.replace("/(tabs)/home");
        }
      }
    } catch (error: any) {
      const responseData = error.response?.data;

      showError(
        "Atenção",
        responseData?.message || error.message || "Erro ao renovar",
      );
    } finally {
      setIsLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <AlertDisplay />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Renovação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card de Valores */}
        <View style={styles.valueCard}>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Valor da Renovação</Text>
            <Text style={styles.valueText}>
              {formatCurrency(parseFloat(data?.value || "0"))}
            </Text>
          </View>

          {data?.isLoan && (
            <>
              <View style={styles.divider} />

              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Você receberá em conta</Text>
                <Text
                  style={[styles.valueText, { color: Colors.green.button }]}
                >
                  {formatCurrency(parseFloat(data?.to_receive || "0"))}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Seção de Chave PIX */}
        <View style={styles.pixSection}>
          <Text style={styles.sectionTitle}>Receber via PIX</Text>

          <View style={[styles.pixCard, pixCorrect && styles.pixCardSelected]}>
            <View style={styles.pixHeader}>
              {/* <View style={styles.pixBadge}>
                <Text style={styles.pixBadgeText}>{pixType}</Text>
              </View> */}
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={styles.changeText}>Alterar chave</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pixKeyText}>{user?.pix}</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setPixCorrect(!pixCorrect)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, pixCorrect && styles.checkboxChecked]}
              >
                {pixCorrect && (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Confirmo que esta chave está correta
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informativo sutil */}
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#64748B"
          />
          <Text style={styles.infoText}>
            O valor será creditado na sua conta em até 30 minutos após a
            aprovação.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.confirmBtn, !pixCorrect && styles.btnDisabled]}
          disabled={!pixCorrect || isLoading}
          onPress={handleConfirm}
        >
          {isLoading && <ActivityIndicator style={{ marginLeft: 8 }} />}
          {!isLoading && (
            <Text style={styles.confirmBtnText}>Confirmar e Solicitar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ChangePixModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleUpdatePix}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 24,
  },
  valueCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  valueRow: {
    marginVertical: 8,
  },
  valueLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  valueText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  pixSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  pixCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  pixCardSelected: {
    borderColor: Colors.green.button,
    backgroundColor: "#F0FDF4",
  },
  pixHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 12,
  },
  pixBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pixBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  changeText: {
    color: "#3B82F6",
    fontWeight: "700",
    fontSize: 14,
  },
  pixKeyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: Colors.green.button,
    borderColor: Colors.green.button,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 10,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  confirmBtn: {
    backgroundColor: Colors.green.button,
    height: 65,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.green.button,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default ConfirmRenewal;
