import { Colors } from "@/constants/Colors";
import ModalNotice from "@/pages/renew/compoents/ModalNotice";
import { renewStatus } from "@/services/renew";
import { useRenewStore } from "@/store/renew";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RenewScreen: React.FC = () => {
  const { renew, setRenew } = useRenewStore();
  const canRenew = !!renew?.can_renew;
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const run = async () => {
        setIsLoadingStatus(true);
        try {
          const response = await renewStatus();
          if (!isActive) return;
          setRenew(response.data.data);
        } finally {
          if (isActive) setIsLoadingStatus(false);
        }
      };

      run();

      return () => {
        isActive = false;
      };
    }, [setRenew]),
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!canRenew) return;

      try {
        const key = "renew_notice_santander_v1";
        const alreadyShown = await AsyncStorage.getItem(key);
        if (alreadyShown === "1") return;

        await AsyncStorage.setItem(key, "1");
        if (!cancelled) setNoticeVisible(true);
      } catch {
        if (!cancelled) setNoticeVisible(true);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [canRenew]);

  if (isLoadingStatus && !renew) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF",
          }}
        >
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ModalNotice
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
      />
      {/* Header Padronizado */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Renovação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card Imersivo */}
        <LinearGradient
          colors={canRenew ? ["#F0FDF4", "#DCFCE7"] : ["#FFFBEB", "#FEF3C7"]}
          style={[
            styles.mainCard,
            { borderColor: canRenew ? "#BBF7D0" : "#FDE68A" },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#FFF" }]}>
            {canRenew ? (
              <Ionicons
                name="checkmark-circle"
                size={36}
                color={Colors.green.button}
              />
            ) : (
              <Ionicons name="time" size={32} color="#D97706" />
            )}
          </View>

          <Text
            style={[
              styles.statusTitle,
              { color: canRenew ? "#166534" : "#92400E" },
            ]}
          >
            {canRenew ? "Renovação Disponível" : "Renovação em Breve"}
          </Text>
          <Text style={styles.statusSubtitle}>
            {canRenew
              ? "Parabéns! Você já pode renovar seu contrato agora mesmo."
              : "Continue pagando suas parcelas para liberar a renovação."}
          </Text>
        </LinearGradient>

        {/* Info Grid (Data e Parcelas) */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconArea}>
              <FontAwesome6
                name="calendar-days"
                size={20}
                color={Colors.green.button}
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>Data prevista</Text>
              <Text style={styles.infoValue}>{renew?.date || "--/--/--"}</Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.infoItem}>
            <View style={styles.infoIconArea}>
              <FontAwesome6
                name="list-check"
                size={20}
                color={Colors.green.button}
              />
            </View>
            <View>
              <Text style={styles.infoLabel}>Restantes</Text>
              <Text style={styles.infoValue}>
                {renew?.remaining_paid || "0"}
              </Text>
            </View>
          </View>
        </View>

        {/* Box Dica - Mais elegante */}
        <View style={styles.tipBox}>
          <View style={styles.tipIconCircle}>
            <Ionicons name="bulb-outline" size={20} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Como acelerar?</Text>
            <Text style={styles.tipText}>
              Mantenha seus pagamentos em dia para antecipar sua próxima
              renovação.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Ações no Rodapé */}
      <View style={styles.footer}>
        {canRenew ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.renewButton}
            onPress={() => router.push("/renew_list")}
          >
            <Text style={styles.renewButtonText}>Renovar Agora</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.disabledBar}>
            <Ionicons name="lock-closed" size={18} color="#94A3B8" />
            <Text style={styles.disabledText}>Renovação Bloqueada</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF" },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  mainCard: {
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#64748B",
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconArea: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  tipBox: {
    flexDirection: "row",
    gap: 15,
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  tipIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0369A1",
    marginBottom: 2,
  },
  tipText: { fontSize: 14, color: "#334155", lineHeight: 20 },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  renewButton: {
    backgroundColor: Colors.green.button,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    shadowColor: Colors.green.button,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  renewButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  disabledBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F1F5F9",
    height: 60,
    borderRadius: 20,
  },
  disabledText: { fontSize: 16, fontWeight: "700", color: "#94A3B8" },
});

export default RenewScreen;
