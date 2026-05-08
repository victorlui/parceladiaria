import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import getIconInfo from "./IconDivergente";
import { Colors } from "@/constants/Colors";
import { documentDisplayNames } from "../utils/displayNames";

interface Props {
  item: string;
  onSelect: (item: any) => void;
  selectedUri?: string;
}

const ItemDivergente: React.FC<Props> = ({ item, onSelect, selectedUri }) => {
  const iconInfo = getIconInfo(item);
  const displayName = documentDisplayNames[item] || item;

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
        {iconInfo.icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{displayName}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: selectedUri ? "#10B981" : "#EA580C" },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: selectedUri ? "#10B981" : "#EA580C" },
            ]}
          >
            {selectedUri ? "Arquivo Selecionado" : "Divergente - Reenviar"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.sendButton, selectedUri && styles.sendButtonSelected]}
        onPress={() => onSelect(item)}
      >
        <Text style={styles.sendButtonText}>
          {selectedUri ? "Alterar" : "Enviar"}
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
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
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
  sendButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
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
