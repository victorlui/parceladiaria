import { Colors } from "@/constants/Colors";
import { renewStatus } from "@/services/renew";
import { useRenewStore } from "@/store/renew";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
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
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [faqExpanded, setFaqExpanded] = useState(false);

  const remainingPaid = renew?.remaining_paid ?? 0;
  const releaseDate = renew?.date || "--/--/--";
  const statusTitle = canRenew ? "Renovação liberada" : "Renovação em breve";
  const statusDescription = canRenew
    ? "Você pode renovar seu empréstimo agora mesmo."
    : "A renovação estará disponível a partir da data abaixo.";
  const remainingLabel =
    remainingPaid > 0
      ? `Parcelas restantes: ${remainingPaid}`
      : "Parcelas restantes quitadas";

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

  if (isLoadingStatus && !renew) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.green.button} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.screenContent}>
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#0F9A94" />
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>

            <View style={styles.heroCard}>
              <View style={styles.heroGlowLarge} />
              <View style={styles.heroGlowSmall} />
              <Text style={styles.eyebrow}>SUA RENOVAÇÃO</Text>
              <Text style={styles.heroTitle}>{statusTitle}</Text>
              <Text style={styles.heroDescription}>{statusDescription}</Text>
              {!canRenew ? (
                <View style={styles.dateHighlightCard}>
                  <Ionicons name="calendar" size={18} color="#F6E7A1" />
                  <View>
                    <Text style={styles.dateHighlightLabel}>
                      DISPONÍVEL A PARTIR DE
                    </Text>
                    <Text style={styles.dateHighlightValue}>{releaseDate}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {canRenew ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>TUDO PRONTO</Text>

                <View style={styles.checkItem}>
                  <View
                    style={[styles.checkIconWrapper, styles.checkIconSuccess]}
                  >
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  </View>
                  <Text style={styles.checkText}>Parcelas mínimas pagas</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.checkItem}>
                  <View
                    style={[styles.checkIconWrapper, styles.checkIconSuccess]}
                  >
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  </View>
                  <Text style={styles.checkText}>
                    Data de liberação atingida
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>
                  O QUE FALTA PARA LIBERAR
                </Text>

                <View style={styles.pendingItem}>
                  <View style={[styles.stepBadge, styles.stepBadgeActive]}>
                    <Text style={styles.stepBadgeActiveText}>1</Text>
                  </View>
                  <Text style={styles.pendingItemTitle}>{remainingLabel}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.pendingItem}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>2</Text>
                  </View>
                  <View style={styles.pendingTextWrapper}>
                    <Text style={styles.pendingItemTitle}>
                      Aguardar a data de liberação
                    </Text>
                    <Text style={styles.pendingItemDescription}>
                      Disponível a partir de {releaseDate}.
                    </Text>
                  </View>
                </View>

                <View style={styles.warningBox}>
                  <Ionicons name="warning" size={18} color="#92400E" />
                  <Text style={styles.warningText}>
                    Pagar as parcelas restantes não libera a renovação. É
                    preciso quitar as parcelas e aguardar a data de liberação.
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.actionsSection}>
            {canRenew ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.renewButton}
                onPress={() => router.push("/renew_list")}
              >
                <Ionicons name="refresh" size={18} color="#FFF" />
                <Text style={styles.renewButtonText}>Renovar Agora</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.disabledButton}>
                <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                <Text style={styles.disabledText}>Renovação indisponível</Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.faqCard}
              onPress={() => setFaqExpanded((prev) => !prev)}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqIcon}>
                  <Ionicons name="help" size={14} color="#0F766E" />
                </View>
                <Text style={styles.faqTitle}>
                  {canRenew
                    ? "Como funciona a renovação?"
                    : "Paguei as parcelas restantes, por que não posso renovar?"}
                </Text>
                <Ionicons
                  name={faqExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#64748B"
                />
              </View>

              {faqExpanded ? (
                <Text style={styles.faqDescription}>
                  {canRenew
                    ? "Ao confirmar a renovação, o novo valor é depositado na sua conta e o saldo devedor atual é quitado automaticamente."
                    : "A renovação depende de duas coisas juntas: ter pago as parcelas restantes e aguardar a data de liberação."}
                </Text>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  screenContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F9A94",
  },
  heroCard: {
    overflow: "hidden",
    backgroundColor: Colors.green.button,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 14,
  },
  heroGlowLarge: {
    position: "absolute",
    right: -36,
    top: -12,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroGlowSmall: {
    position: "absolute",
    right: 92,
    bottom: -36,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "800",
    color: "rgba(255,255,255,0.72)",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.88)",
    maxWidth: "88%",
  },
  dateHighlightCard: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateHighlightLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  dateHighlightValue: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFF",
    lineHeight: 30,
  },
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.4,
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  checkIconSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  checkIconPending: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },
  checkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeActive: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  stepBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },
  stepBadgeActiveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#D97706",
  },
  pendingTextWrapper: {
    flex: 1,
  },
  pendingItemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    paddingTop: 2,
  },
  pendingItemDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  warningBox: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    padding: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#92400E",
  },
  renewButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#0E5B52",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0E5B52",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  renewButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  disabledButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  faqCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionsSection: {
    marginTop: 18,
    gap: 16,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  faqIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  faqTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  faqDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
});

export default RenewScreen;
