import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { documentDisplayNames } from "../utils/displayNames";
import getIconInfo from "./IconDivergente";

interface Props {
  item: string;
  onSelect: (item: any) => void;
  selectedUri?: string;
  disabled?: boolean;
  disabledLabel?: string;
}

const ItemDivergente: React.FC<Props> = ({
  item,
  onSelect,
  selectedUri,
  disabled = false,
  disabledLabel = "Aguardando",
}) => {
  const iconInfo = getIconInfo(item);
  const displayName = documentDisplayNames[item] || item;
  const isOpenFinance = item === "openfinance";
  const isPalenca = item === "palenca";
  const isSelected = Boolean(selectedUri);
  const isButtonDisabled = disabled || (isOpenFinance && isSelected);
  const actionLabel = disabled
    ? disabledLabel
    : isSelected
      ? isOpenFinance
        ? "Conectado"
        : "Alterar"
      : isOpenFinance || isPalenca
        ? "Conectar"
        : "Enviar";
  const statusColor = disabled ? "#9CA3AF" : isSelected ? "#10B981" : "#EA580C";

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
        {iconInfo.icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {displayName}
        </Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {actionLabel}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        disabled={isButtonDisabled}
        style={[
          styles.sendButton,
          isSelected && styles.sendButtonSelected,
          isButtonDisabled && styles.sendButtonDisabled,
        ]}
        onPress={() => onSelect(item)}
      >
        <Text
          style={[
            styles.sendButtonText,
            isButtonDisabled && styles.sendButtonTextDisabled,
          ]}
        >
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 18,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sendButton: {
    backgroundColor: Colors.green.button,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendButtonSelected: {
    backgroundColor: "#0284C7",
  },
  sendButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  sendButtonTextDisabled: {
    color: "#9CA3AF",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
});

export default ItemDivergente;
