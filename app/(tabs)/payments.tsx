import InfoBalance from "@/components/ui/InfoBalance";
import StatusBar from "@/components/ui/StatusBar";
import api from "@/services/api";
import { Colors } from "@/constants/Colors";
import { InstallmentsProps } from "@/interfaces/installments";
import { ApiUserData } from "@/interfaces/login_inteface";
import { useAuthStore } from "@/store/auth";
import { useQRCodeStore } from "@/store/qrcode";
import { formatCurrency } from "@/utils/formats";
import { FontAwesome5 } from "@expo/vector-icons";
import { format, parse, parseISO } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";

import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  GRADIENT_START: "#209c91",
  GRADIENT_END: "#28a999",
  TEXT_LIGHT: "#ffffff",
  TEXT_DARK: "#28a999",
  BADGE_BORDER: "#ffffff",
  BUTTON_BG: "#ffffff",
  BUTTON_TEXT: "#28a999",
  EMOJI_COLOR: "#ffcc66",
  BADGE_COLOR: "#38B77F",
};

const PaymentsTab: React.FC = () => {
  const { user } = useAuthStore();
  const { generateQRCode } = useQRCodeStore();
  const [loading, setLoading] = React.useState(false);
  const [installments, setInstallments] = React.useState<InstallmentsProps[]>(
    []
  );
  const [userData, setUserData] = React.useState<ApiUserData | null>(null);
  const [selectedInstallments, setSelectedInstallments] = React.useState<
    number[]
  >([]);

  const getRenew = async () => {
    setLoading(true);
    try {
      const responseClient = await api.get("/v1/client");

      const unpaid = responseClient.data.data.data.lastLoan.installments.filter(
        (i: any) => i.paid === "Não"
      );

      // Ordena por due_date (crescente) e depois por id (decrescente)
      const sorted = unpaid.slice().sort((a: any, b: any) => {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return b.id - a.id; // mesma data → id maior primeiro
      });

      console.log("sorted", sorted);
      setInstallments(sorted);

      if (sorted.length > 0) {
        setSelectedInstallments([sorted[0].id]);
      }

      setUserData({
        ...user,
        lastLoan: responseClient.data.data.data.lastLoan,
        pixKey: user?.pixKey ?? null,
      });
    } catch (error: any) {
      return error.response;
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getRenew();
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return "";
    const base = dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
    const localParsed = parse(base, "yyyy-MM-dd", new Date());
    const dt = isNaN(localParsed.getTime()) ? parseISO(dateStr) : localParsed;
    return format(dt, "dd/MM/yyyy");
  };

  const toggleSelect = (id: number) => {
    setSelectedInstallments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Seleção em massa
  const allSelected =
    installments.length > 0 &&
    installments.every((i) => selectedInstallments.includes(i.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedInstallments([]);
    } else {
      setSelectedInstallments(installments.map((i) => i.id));
    }
  };

  // Soma do total selecionado
  const selectedTotal = React.useMemo(() => {
    return installments.reduce((sum, inst) => {
      return selectedInstallments.includes(inst.id)
        ? sum + Number(inst.amount)
        : sum;
    }, 0);
  }, [installments, selectedInstallments]);

  const skeletonOpacity = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [skeletonOpacity]);

  const handlePay = async () => {
    generateQRCode(selectedInstallments);
    setSelectedInstallments([]);
    router.push("/(app)/qrdcode");
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <StatusBar />

      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.header}>
          <FontAwesome5 name="arrow-left" size={18} color="black" />
          <Text style={styles.title}>Pagamentos</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {loading ? (
            <Animated.View style={{ opacity: skeletonOpacity }}>
              <View
                style={{
                  height: 20,
                  width: 140,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 6,
                  marginTop: 20,
                }}
              />
              <View
                style={{
                  height: 36,
                  width: 220,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 6,
                  marginVertical: 8,
                }}
              />
              <View
                style={{
                  width: 260,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 6,
                }}
              />
            </Animated.View>
          ) : (
            <InfoBalance user={userData || null} />
          )}
        </LinearGradient>

        <View
          style={[
            styles.body,
            { paddingBottom: selectedInstallments.length > 0 ? 150 : 80 },
          ]}
        >
          {!loading && (
            <Text style={styles.infoText}>
              Selecione as parcelas para pagar
            </Text>
          )}

          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <Animated.View key={idx} style={{ opacity: skeletonOpacity }}>
                  <View style={styles.unpaidContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        { borderColor: "#E5E7EB", backgroundColor: "#E5E7EB" },
                      ]}
                    />
                    <View
                      style={[
                        styles.installment,
                        { backgroundColor: "#E5E7EB" },
                      ]}
                    />
                    <View style={{ flex: 1, gap: 6 }}>
                      <View
                        style={{
                          height: 16,
                          backgroundColor: "#E5E7EB",
                          borderRadius: 6,
                          width: "50%",
                        }}
                      />
                      <View
                        style={{
                          height: 14,
                          backgroundColor: "#E5E7EB",
                          borderRadius: 6,
                          width: "35%",
                        }}
                      />
                    </View>
                  </View>
                </Animated.View>
              ))
            : installments?.map((item) => {
                const isSelected = selectedInstallments.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.unpaidContainer,
                      isSelected && styles.unpaidSelected,
                    ]}
                    onPress={() => toggleSelect(item.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: isSelected
                            ? Colors.green.primary
                            : Colors.borderColor,
                          backgroundColor: isSelected
                            ? Colors.green.primary
                            : Colors.white,
                        },
                      ]}
                    >
                      {isSelected && (
                        <FontAwesome5 name="check" size={14} color="white" />
                      )}
                    </View>
                    <LinearGradient
                      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.installment}
                    >
                      <Text style={styles.textInstallment}>
                        {item.installment}
                      </Text>
                    </LinearGradient>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.textAmount}>
                        {formatCurrency(Number(item.amount))}
                      </Text>
                      <Text style={styles.textDate}>
                        Vencimento: {formatDateBR(item.due_date)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

          {/* Botão Selecionar Todas / Limpar Seleção */}
          {!loading && installments.length > 0 && (
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={handleSelectAll}
              activeOpacity={0.8}
            >
              <Text style={styles.selectAllButtonText}>
                {allSelected ? "Limpar seleção" : "Selecionar todas"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {selectedInstallments.length > 0 && (
        <View style={styles.selectInstallmentContainer}>
          <View style={{ flex: 2 }}>
            <Text style={styles.textInfo}>
              Total de {selectedInstallments.length} parcelas selecionadas
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(Number(selectedTotal))}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePay}
            activeOpacity={0.8}
          >
            <Text style={styles.payButtonText}>Pagar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  body: {
    flexDirection: "column",
    gap: 8,
    paddingTop: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 20,
  },
  unpaidContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 8,
  },
  unpaidSelected: {
    borderWidth: 1,
    borderColor: COLORS.BADGE_COLOR,
  },
  installment: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  textInstallment: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
  },
  textAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
  },
  textDate: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.gray.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.gray.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: Colors.green.primary,
    borderColor: Colors.green.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  selectAllButton: {
    marginTop: 10,
    backgroundColor: Colors.green.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectAllButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  selectInstallmentContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: Colors.green.primary,
    padding: 12,
    paddingBottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textInfo: {
    color: "#d9dfe7",
    fontSize: 13,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.white,
  },
  payButton: {
    marginTop: 10,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  payButtonText: {
    color: Colors.green.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PaymentsTab;
