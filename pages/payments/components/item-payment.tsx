import { Colors } from "@/constants/Colors";
import {
  formatCurrency,
  formatCurrencyBRL,
  formatDateToBR,
} from "@/utils/formats";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { endOfDay, isBefore, isValid, parseISO } from "date-fns";
interface ItemPaymentProps {
  item: any;
  itemSelected: number[];
  toggleSelect: (id: number) => void;
}

const COLORS = {
  GRADIENT_START: "#209c91",
  GRADIENT_END: "#28a999",
  ERROR: "#ff3b30",
};

const ItemPayment: React.FC<ItemPaymentProps> = ({
  item,
  itemSelected,
  toggleSelect,
}) => {
  const isSelected = itemSelected.includes(item.id);
  const now = new Date();
  const dueDate =
    typeof item?.due_date === "string"
      ? parseISO(item.due_date)
      : new Date(item?.due_date);
  const isOverdue = isValid(dueDate) && isBefore(endOfDay(dueDate), now);

  return (
    <TouchableOpacity
      key={item.id}
      style={[styles.unpaidContainer, isSelected && styles.unpaidSelected]}
      onPress={() => toggleSelect(item.id)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: isSelected ? Colors.green.primary : Colors.borderColor,
            backgroundColor: isSelected ? Colors.green.primary : Colors.white,
          },
        ]}
      >
        {isSelected && <FontAwesome5 name="check" size={14} color="white" />}
      </View>
      <LinearGradient
        colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.installment}
      >
        <Text style={styles.textInstallment}>{item.installment}</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={[styles.textAmount, isOverdue && { color: COLORS.ERROR }]}>
          {formatCurrency(Number(item.amount))}
        </Text>
        <View style={styles.dateRow}>
          <Text style={[styles.textDate, isOverdue && { color: COLORS.ERROR }]}>
            Vencimento: {formatDateToBR(item.due_date)}
          </Text>
          {isOverdue && (
            <View style={styles.badgeOverdue}>
              <Text style={styles.badgeOverdueText}>Vencida</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    borderColor: "#38B77F",
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  badgeOverdue: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeOverdueText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
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
});

export default ItemPayment;
