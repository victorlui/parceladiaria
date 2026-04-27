import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AlertMessage: React.FC = () => {
  return (
    <LinearGradient
      colors={["#fff9e6", "#fff0b3", "#ffecb3"]}
      start={[0, 1]}
      end={[1, 0]}
      style={styles.warning}
    >
      <FontAwesome5 name="shield-alt" size={18} color="#D97706" />
      <Text style={styles.alertaTexto}>
        Para sua segurança, realize pagamento somente através do aplicativo
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  warning: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    backgroundColor: "#fff9e6",
    borderLeftWidth: 5,
    borderColor: "#D97706",
    borderRadius: 12,
    marginVertical: 10,
  },
  alertaTexto: {
    flex: 1, // Permite que o texto ocupe o espaço restante
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontFamily: "System", // Use a fonte padrão ou uma fonte customizada do Expo
    color: "#5d4037", // Cor do texto (marrom escuro)
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default AlertMessage;
