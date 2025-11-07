// RenewScreen component
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import StatusBar from "@/components/ui/StatusBar";
import { useRenewStore } from "@/store/renew";

// RenewScreen component
const RenewScreen: React.FC = () => {
  const { renew } = useRenewStore();
  const canRenew = !!renew?.can_renew;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={Colors.green.primary}
            />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        {canRenew ? (
          <LinearGradient
            colors={[Colors.success.light, Colors.success.medium]}
            style={styles.mainCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.checkCircle}>
              <FontAwesome
                name="check-circle"
                size={32}
                color={Colors.green.primary}
              />
            </View>

            <Text style={styles.availableTitle}>Renovação Disponível</Text>
            <Text style={styles.availableSubtitle}>
              Parabéns! Você já pode renovar agora mesmo.
            </Text>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={[Colors.yellow.light, Colors.yellow.medium]}
            style={styles.mainCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.clockCircle}>
              <Ionicons
                name="time-outline"
                size={26}
                color={Colors.orange.primary}
              />
            </View>

            <Text style={styles.title}>Renovação em Breve</Text>
            <Text style={styles.subtitle}>
              Continue pagando suas parcelas para liberar a renovação.
            </Text>
          </LinearGradient>
        )}

        {/* Card data prevista */}
        <View style={styles.dateCard}>
          <View style={styles.dateHeader}>
            <FontAwesome6
              name="calendar-check"
              size={24}
              color={Colors.green.primary}
            />
            <Text style={styles.dateLabel}>Data prevista</Text>
            <Text style={styles.dateValue}>{renew?.date}</Text>
          </View>
          <View style={styles.dateHeader}>
            <FontAwesome5
              name="list-ol"
              size={24}
              color={Colors.green.primary}
            />
            <Text style={styles.dateLabel}>Parcela restantes </Text>
            <Text style={styles.dateValue}>{renew?.remaining_paid}</Text>
          </View>
        </View>

        {!canRenew && (
          <View style={styles.disabledBar}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={Colors.gray.primary}
            />
            <Text style={styles.disabledText}>Renovação Indisponível</Text>
          </View>
        )}

        {canRenew && (
          <TouchableOpacity
            style={styles.renewButton}
            onPress={() => router.push("/renew_list")}
          >
            <FontAwesome name="refresh" size={20} color="white" />
            <Text style={styles.renewButtonText}>Renovar Agora</Text>
          </TouchableOpacity>
        )}

        {/* Box dica */}
        <View style={styles.tipBox}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={Colors.info.text}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Dica:</Text>
            <Text style={styles.tipText}>
              Mantenha seus pagamentos em dia para liberar a renovação mais
              rápido!
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RenewScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Header
  header: { marginVertical: 15 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { fontSize: 16, color: Colors.green.primary, fontWeight: "600" },

  // Card principal
  mainCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  clockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
    elevation: 2,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
    elevation: 2,
  },
  availableTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.green.primary,
    marginBottom: 8,
  },
  availableSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#4B5563",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#92400E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
  },

  // Card data prevista
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
  },
  dateHeader: {
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dateLabel: { fontSize: 13, color: "#6B7280" },
  dateValue: { fontSize: 16, fontWeight: "700", color: "#111827" },

  // Barra desabilitada
  disabledBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disabledText: { fontSize: 14, fontWeight: "600", color: Colors.gray.primary },

  // Box dica
  tipBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.info.bg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.info.text,
    marginBottom: 2,
  },
  tipText: { fontSize: 14, color: "#374151" },
  // Botão renovar
  renewButton: {
    backgroundColor: Colors.green.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    flexDirection: "row",
    gap: 8,
  },
  renewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});
