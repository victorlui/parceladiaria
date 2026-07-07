import { Colors } from "@/constants/Colors";
import { formatCurrencyBRL, formatDateToBR } from "@/utils/formats";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Indicacao } from "../types/indications";

interface Props {
  indications: Indicacao[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; messageColor: string }
> = {
  concluido: {
    label: "Concluído",
    color: "#22A75D",
    messageColor: "#22A75D",
  },
  aprovado: {
    label: "Aprovado",
    color: "#24A8F2",
    messageColor: "#24A8F2",
  },
};

const getRewardLabel = (value: Indicacao["recompensa"]) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `R$ ${formatCurrencyBRL(value)}`;
};

const getDescription = (item: Indicacao) => {
  const reward = getRewardLabel(item.recompensa);
  const normalizedStatus = item.status?.toLowerCase();

  if (normalizedStatus === "concluido") {
    return reward
      ? `Essa indicação te rendeu ${reward}`
      : "Essa indicação foi concluída com sucesso";
  }

  if (normalizedStatus === "aprovado") {
    return reward
      ? `Aprovado - ${reward} a caminho do seu PIX`
      : "Aprovado - pagamento a caminho do seu PIX";
  }

  return reward
    ? `${reward} disponível para esta indicação`
    : "Indicação em andamento";
};

export default function ListaIndicacoes({ indications }: Props) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  if (!indications?.length) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Suas Indicações</Text>
        <Text style={styles.emptyText}>
          Você ainda não possui indicações registradas.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Suas Indicações</Text>

      <View style={styles.list}>
        {indications.map((item, index) => {
          const normalizedStatus = item.status?.toLowerCase();
          const statusConfig =
            STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG.aprovado;

          return (
            <View
              key={item.id}
              style={[
                styles.item,
                index < indications.length - 1 && styles.itemBorder,
              ]}
            >
              <View style={styles.itemContent}>
                <Text style={styles.name}>{item.nome}</Text>
                <Text
                  style={[
                    styles.description,
                    { color: statusConfig.messageColor },
                  ]}
                >
                  {getDescription(item)}
                </Text>
                <Text style={styles.meta}>
                  {formatDateToBR(item.data)} • {item.parcelas?.pagas || 0}/
                  {item.parcelas?.total || 0} parcelas pagas
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusConfig.color },
                  ]}
                />
                <Text style={styles.statusText}>{statusConfig.label}</Text>
              </View>
            </View>
          );
        })}
      </View>
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
    title: {
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
      color: "#233047",
    },
    list: {
      marginTop: isSmallDevice ? 18 : 22,
      gap: isSmallDevice ? 18 : 22,
    },
    item: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      paddingBottom: isSmallDevice ? 16 : 18,
    },
    itemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    itemContent: {
      flex: 1,
      gap: 6,
      paddingRight: 4,
    },
    name: {
      fontSize: isSmallDevice ? 15 : 17,
      lineHeight: isSmallDevice ? 22 : 25,
      fontWeight: "700",
      color: Colors.black,
    },
    description: {
      fontSize: isSmallDevice ? 14 : 15,
      lineHeight: isSmallDevice ? 22 : 24,
      fontWeight: "700",
    },
    meta: {
      fontSize: isSmallDevice ? 11 : 12,
      lineHeight: isSmallDevice ? 18 : 20,
      color: "#64748B",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingTop: 2,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    statusText: {
      fontSize: isSmallDevice ? 14 : 15,
      lineHeight: isSmallDevice ? 22 : 24,
      fontWeight: "600",
      color: "#233047",
    },
    emptyText: {
      marginTop: 12,
      fontSize: isSmallDevice ? 13 : 14,
      lineHeight: isSmallDevice ? 20 : 22,
      color: "#64748B",
    },
  });
};
