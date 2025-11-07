import { Colors } from "@/constants/Colors";
import { RenewListProps } from "@/interfaces/renew";
import { formatCurrency } from "@/utils/formats";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  item: RenewListProps;
  onPress: (id: number) => void;
  selectedId: number | null;
}

const ItemRenew: React.FC<Props> = ({ item, onPress, selectedId }) => {
  const isSelected = item.id === selectedId;

  const handleSelect = (id: number) => {
    onPress(id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleSelect(item.id)}
      style={[
        styles.card,

        {
          borderColor: isSelected ? Colors.green.primary : Colors.borderColor,
        },
      ]}
    >
      {/* Header do cartão */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {formatCurrency(Number(item.loan_value))}
          </Text>
          <Text style={styles.cardSubtitle}>
            em {item.installments} parcelas diárias de{" "}
            {formatCurrency(Number(item.installment_value))}
          </Text>
        </View>

        {/* Radio */}
        <View
          style={[
            styles.radio,
            {
              borderColor: isSelected
                ? Colors.green.primary
                : Colors.borderColor,
            },
          ]}
        >
          {isSelected && <View style={styles.radioDot} />}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Linhas de taxas e descontos */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>(-) IOF ({item.tax_iof})</Text>
        <Text style={styles.rowValue}>
          {formatCurrency(Number(item.discount_iof))}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>(-) Taxa TIC ({item.tax_tic})</Text>
        <Text style={styles.rowValue}>
          {formatCurrency(Number(item.discount_tic))}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>(-) Dívida Atual</Text>
        <Text style={styles.rowValue}>{formatCurrency(item.debt)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Você recebe</Text>
        <Text style={styles.footerValue}>
          {formatCurrency(Number(item.to_receive))}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: "rgba(100, 255, 100, 0.2)",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderColor,
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  rowValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  footerLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  footerValue: {
    fontSize: 16,
    color: Colors.green.primary,
    fontWeight: "800",
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.green.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});

export default ItemRenew;
