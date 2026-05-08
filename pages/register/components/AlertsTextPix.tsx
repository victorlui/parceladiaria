import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const AlertsTextPix: React.FC = () => {
  return (
    <LinearGradient
      colors={["#fff9e6", "#fff0b3", "#ffecb3"]}
      start={[0, 1]}
      end={[1, 0]}
      style={styles.warning}
    >
      {[
        "A chave PIX não pode estar vinculada a um CNPJ",
        "Use apenas chaves PIX de pessoas físicas (CPF)",
      ].map((text) => (
        <View key={text} style={styles.warningRow}>
          <FontAwesome5 name="exclamation-triangle" size={14} color="#D97706" />

          <Text style={styles.alertaTexto}>Atenção: {text}</Text>
        </View>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  warning: {
    gap: 10,
    paddingHorizontal: 13,
    borderLeftWidth: 5,
    borderColor: "#D97706",
    borderRadius: 12,
    marginVertical: 10,
    paddingVertical: 15,
  },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  alertaTexto: {
    color: "#5d4037",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});

export default AlertsTextPix;
