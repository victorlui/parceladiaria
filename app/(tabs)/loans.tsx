// Componente LoansTab
import { AnalyticsService } from "@/analytics/analytics.service";
import {
  ANALYTICS_FLOWS,
  TAB_ANALYTICS_SOURCES,
  TAB_SCREENS,
} from "@/analytics/events";
import ItemLoan from "@/components/loans/item-loan";
import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { LoansProps } from "@/interfaces/loans";
import { getLoans } from "@/services/loans";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoansTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<LoansProps[]>([]);

  const enhanceLoan = (loan: LoansProps): LoansProps => {
    const totalInstallments =
      loan.installments?.reduce(
        (max, i) => Math.max(max, Number(i.installment || 0)),
        0,
      ) || 0;

    const paidCount =
      loan.installments?.filter((i) => i.paid === "Sim").length || 0;

    const isPaidOff = totalInstallments > 0 && paidCount >= totalInstallments;

    return { ...loan, totalInstallments, paidCount, isPaidOff };
  };

  const fetchLoans = async () => {
    try {
      const response = await getLoans({
        flow: ANALYTICS_FLOWS.APP,
        source: TAB_ANALYTICS_SOURCES.LOANS_LOAD,
      });
      const enhanced = (response || []).map((loan: any) =>
        enhanceLoan(loan as LoansProps),
      );

      setLoans(enhanced);
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      AnalyticsService.screen(TAB_SCREENS.LOANS, {
        flow: ANALYTICS_FLOWS.APP,
      });
      fetchLoans();
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const LoanCard: React.FC<{ loan: LoansProps }> = ({ loan }) => {
    return <ItemLoan loan={loan} />;
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <StatusBar />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Meus Empréstimos</Text>
        <Text style={styles.subtitle}>
          Histórico completo dos seus empréstimos
        </Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size={30} color={Colors.green.primary} />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.green.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.primary,
    marginBottom: 16,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
});

export default LoansTab;
