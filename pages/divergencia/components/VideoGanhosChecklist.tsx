import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { VideoGanhosCriterios } from "../types/videoGanhos";

type Props = {
  criterios: VideoGanhosCriterios;
};

const checklistOrder: Array<{
  key: keyof VideoGanhosCriterios;
  label: string;
}> = [
  { key: "aplicativo", label: "É aplicativo?" },
  { key: "nome", label: "Possui nome?" },
  { key: "foto", label: "Tem foto?" },
  { key: "ganhos", label: "Exibe os ganhos?" },
];

function getStatusStyles(value: boolean | null) {
  if (value === true) {
    return {
      icon: "checkmark",
      iconColor: "#15803D",
      badgeColor: "#DCFCE7",
      textColor: "#166534",
      helperText: "Encontrado no vídeo",
    } as const;
  }

  if (value === false) {
    return {
      icon: "close",
      iconColor: "#DC2626",
      badgeColor: "#FEE2E2",
      textColor: "#991B1B",
      helperText: "Não encontrado no vídeo",
    } as const;
  }

  return {
    icon: "time-outline",
    iconColor: "#6B7280",
    badgeColor: "#E5E7EB",
    textColor: "#4B5563",
    helperText: "Ainda em processamento",
  } as const;
}

export default function VideoGanhosChecklist({ criterios }: Props) {
  return (
    <View style={styles.container}>
      {checklistOrder.map(({ key, label }) => {
        const value = criterios[key];
        const statusStyles = getStatusStyles(value);

        return (
          <View key={key} style={styles.item}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: statusStyles.badgeColor,
                },
              ]}
            >
              <Ionicons
                name={statusStyles.icon}
                size={18}
                color={statusStyles.iconColor}
              />
            </View>

            <View style={styles.textContent}>
              <Text style={styles.label}>{label}</Text>
              <Text style={[styles.helper, { color: statusStyles.textColor }]}>
                {statusStyles.helperText}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  helper: {
    fontSize: 12,
    fontWeight: "500",
  },
});
