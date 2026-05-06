import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TipItemProps {
  icon: React.ReactNode;
  label: string;
}
const TipItem: React.FC<TipItemProps> = ({ icon, label }) => {
  return (
    <View style={styles.tipRow}>
      <LinearGradient
        style={styles.tipIcon}
        colors={[Colors.green.primary, "#28a999"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon}
      </LinearGradient>
      <Text style={styles.tipText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
    padding: 8,
    borderRadius: 50,
  },
  tipText: {
    fontSize: 14,
  },
});

export default TipItem;
