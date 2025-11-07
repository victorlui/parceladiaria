import { Colors } from "@/constants/Colors";
import { InstallmentsProps } from "@/interfaces/installments";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import TimelineItem from "../ui/Timeline";
import { router } from "expo-router";

interface Props {
  installments: InstallmentsProps[];
  totalInstallments: number;
  loading: boolean;
}

const HistoryRecent: React.FC<Props> = ({
  installments,
  totalInstallments,
  loading,
}) => {
  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerInfog}>
          <FontAwesome5 name="history" size={18} color={Colors.green.primary} />
          <Text style={styles.headerInfoText}>Histórico recente</Text>
        </View>
        <TouchableOpacity
          style={styles.verMais}
          onPress={() => router.push("/(tabs)/loans")}
        >
          <Text style={styles.verMaisText}>Ver mais</Text>
          <Feather
            name="chevron-right"
            size={18}
            color={Colors.green.primary}
          />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 50,
          }}
        >
          <ActivityIndicator size={30} color={Colors.green.primary} />
        </View>
      ) : (
        <View style={styles.history}>
          {installments.map((item, index) => (
            <TimelineItem
              key={index}
              amount={item.amount}
              installment={item.installment}
              totalInstallments={totalInstallments}
              isLast={index === installments.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerInfog: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerInfoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.green.primary,
  },
  verMais: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  verMaisText: {
    fontSize: 14,
    color: Colors.green.primary,
  },
  history: {
    paddingVertical: 20, // Espaçamento entre um item e o próximo
  },
});

export default HistoryRecent;
