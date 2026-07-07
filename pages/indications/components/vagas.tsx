import { Colors } from "@/constants/Colors";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { IndicacoesV3 } from "../types/indications";

interface Props {
  indicationsV3: IndicacoesV3 | null;
}

export default function Vagas({ indicationsV3 }: Props) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  const totalVagas = indicationsV3?.vagas_total ?? 0;
  const vagasUsadas = indicationsV3?.vagas_usadas ?? 0;
  const vagasDisponiveis = indicationsV3?.vagas_disponiveis ?? 0;
  const percentualPreenchido =
    totalVagas > 0 ? Math.min((vagasUsadas / totalVagas) * 100, 100) : 0;
  const mostrarCtaRenovacao =
    vagasDisponiveis <= 0 && Boolean(indicationsV3?.cta_renovacao);

  const vagasDisponiveisLabel =
    vagasDisponiveis === 1
      ? "1 vaga livre"
      : `${vagasDisponiveis} vagas livres`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FontAwesome5
            name="bullseye"
            size={width < 360 ? 18 : 20}
            color={Colors.primaryColor}
          />
          <Text style={styles.title}>Suas vagas</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Text style={styles.progressText}>
          {vagasUsadas}/{totalVagas}
        </Text>
        <Text style={styles.availableText}>{vagasDisponiveisLabel}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${percentualPreenchido}%` }]}
        />
      </View>

      {mostrarCtaRenovacao ? (
        <View style={styles.renewContainer}>
          <Text style={styles.renewMessage}>
            Você fechou {vagasUsadas}/{totalVagas}! Renove seu contrato e abra
            novas vagas.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.renewButton}
            onPress={() => router.push("/(tabs)/renew")}
          >
            <Ionicons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.renewButtonText}>Renovar agora</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  return StyleSheet.create({
    card: {
      backgroundColor: "#F1FAF8",
      borderRadius: isSmallDevice ? 22 : 26,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
      paddingVertical: isSmallDevice ? 20 : isMediumDevice ? 24 : 28,
      borderWidth: 1,
      borderColor: "#D7E1DF",
      shadowColor: "#053D39",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    header: {
      marginBottom: isSmallDevice ? 16 : 18,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    title: {
      color: "#233047",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
    },
    metricsRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: isSmallDevice ? 16 : 18,
    },
    progressText: {
      color: "#0F172A",
      fontSize: isSmallDevice ? 32 : isMediumDevice ? 36 : 40,
      lineHeight: isSmallDevice ? 40 : isMediumDevice ? 44 : 48,
      fontWeight: "800",
    },
    availableText: {
      flexShrink: 1,
      color: "#334155",
      fontSize: isSmallDevice ? 15 : isMediumDevice ? 16 : 18,
      lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
      fontWeight: "500",
      textAlign: "right",
      paddingBottom: 4,
    },
    progressTrack: {
      width: "100%",
      height: isSmallDevice ? 14 : 16,
      borderRadius: 999,
      backgroundColor: "#DDE6E5",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: "#18B552",
    },
    renewContainer: {
      marginTop: isSmallDevice ? 18 : 22,
      paddingHorizontal: isSmallDevice ? 16 : 20,
      paddingVertical: isSmallDevice ? 16 : 20,
      borderRadius: isSmallDevice ? 18 : 20,
      borderWidth: 1,
      borderColor: "#9DE7B8",
      backgroundColor: "#EEF9F1",
      gap: 14,
    },
    renewMessage: {
      color: "#216946",
      fontSize: isSmallDevice ? 15 : isMediumDevice ? 16 : 18,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 26 : 28,
      fontWeight: "700",
      textAlign: "center",
    },
    renewButton: {
      minHeight: isSmallDevice ? 52 : 58,
      borderRadius: 18,
      backgroundColor: "#127B74",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: "#0C5A55",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 4,
    },
    renewButtonText: {
      color: Colors.white,
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 26 : 28,
      fontWeight: "700",
    },
  });
};
