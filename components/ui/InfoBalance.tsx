import { ApiUserData } from "@/interfaces/login_inteface";
import { formatCurrency } from "@/utils/formats";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  user: ApiUserData | null;
}

const COLORS = {
  TEXT_LIGHT: "#ffffff",
};

const InfoBalance: React.FC<Props> = ({ user }) => {
  const outstandingBalance = useMemo(() => {
    return user?.lastLoan?.installments?.reduce((total, installment) => {
      if (installment.paid === "Sim") return total;
      return total + (parseFloat(String(installment.amount)) || 0);
    }, 0);
  }, [user?.lastLoan]);

  const remainingInstallments = useMemo(() => {
    return (
      user?.lastLoan?.installments?.filter(
        (installment) => installment.paid !== "Sim"
      ).length ?? 0
    );
  }, [user?.lastLoan]);
  return (
    <View style={styles.body}>
      <Text style={styles.bodyText}>Saldo devedor</Text>
      <Text style={styles.bodyValue}>
        {formatCurrency(Number(outstandingBalance))}
      </Text>
      <Text style={[styles.bodyText, { textTransform: "none" }]}>
        {remainingInstallments}x de{" "}
        {formatCurrency(Number(user?.lastLoan?.installment_amount))} restantes
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    marginVertical: 25,
  },
  bodyText: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "bold",
    color: COLORS.TEXT_LIGHT,
    textTransform: "uppercase",
  },
  bodyValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.TEXT_LIGHT,
    marginVertical: 5,
  },
});

export default InfoBalance;
