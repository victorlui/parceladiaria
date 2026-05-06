import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { formatCurrency } from "@/utils/formats";
import { useQRCodeStore } from "@/store/qrcode";
import { useQueryDataClient } from "@/hooks/useQueryClient";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderInfo from "./components/header";
import ItemPayment from "./components/item-payment";
import Skeleton from "./components/skeleton";

const PaymentsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { refetch, isFetching } = useQueryDataClient();
  const { generateQRCode } = useQRCodeStore();
  const router = useRouter();
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>(
    [],
  );

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const installments = useMemo(() => {
    const unpaid =
      user?.lastLoan?.installments?.filter((i: any) => i.paid === "Não") ?? [];

    // Ordena por due_date (crescente) e depois por id (decrescente)
    return [...unpaid].sort((a: any, b: any) => {
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return b.id - a.id; // mesma data → id maior primeiro
    });
  }, [user]);

  const selectedTotal = React.useMemo(() => {
    return installments.reduce((sum, inst) => {
      return selectedInstallments.includes(inst.id)
        ? sum + Number(inst.amount)
        : sum;
    }, 0);
  }, [installments, selectedInstallments]);

  const toggleSelect = (id: number) => {
    setSelectedInstallments((prev) => {
      const exists = prev.includes(id);
      return exists ? prev.filter((i) => i !== id) : [...prev, id];
    });
  };

  const handlePay = async () => {
    generateQRCode(selectedInstallments);
    setSelectedInstallments([]);
    router.push("/(app)/qrdcode");
  };

  const allSelected =
    installments.length > 0 &&
    installments.every((i) => selectedInstallments.includes(i.id));

  const handleSelectAll = () =>
    setSelectedInstallments(installments.map((i) => i.id));
  const handleClearSelection = () => setSelectedInstallments([]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.header}>
          <FontAwesome5 name="arrow-left" size={18} color="black" />
          <Text style={styles.title}>Pagamentos</Text>
        </TouchableOpacity>
        <HeaderInfo
          loading={isFetching}
          skeletonOpacity={0.8}
          user={user || null}
        />
        <View
          style={[
            styles.body,
            { paddingBottom: selectedInstallments.length > 0 ? 150 : 80 },
          ]}
        >
          {!isFetching && installments.length > 0 && (
            <Text style={styles.infoText}>
              Selecione as parcelas para pagar
            </Text>
          )}

          {isFetching && (
            <View style={{ marginTop: 10, gap: 10 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} />
              ))}
            </View>
          )}

          {!isFetching && installments.length === 0 && (
            <View style={styles.emptyContainer}>
              <FontAwesome5
                name="clipboard-check"
                size={64}
                color={Colors.gray.primary}
              />
              <Text style={styles.emptyTitle}>Tudo certo por aqui!</Text>
              <Text style={styles.emptySubtitle}>
                Você não possui parcelas pendentes no momento.
              </Text>
            </View>
          )}

          {!isFetching &&
            installments.length > 0 &&
            installments.map((item: any) => (
              <ItemPayment
                key={item.id}
                itemSelected={selectedInstallments}
                toggleSelect={toggleSelect}
                item={item}
              />
            ))}
          {!isFetching && (
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={allSelected ? handleClearSelection : handleSelectAll}
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
    padding: 20,
    flex: 1,
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
    color: Colors.black,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.gray.primary,
    textAlign: "center",
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

export default PaymentsScreen;
