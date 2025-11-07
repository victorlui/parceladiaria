import { ApiUserData } from "@/interfaces/login_inteface";
import { Fontisto } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import InfoBalance from "../ui/InfoBalance";
import { router } from "expo-router";

const COLORS = {
  GRADIENT_START: "#209c91",
  GRADIENT_END: "#28a999",
  TEXT_LIGHT: "#ffffff",
  TEXT_DARK: "#28a999",
  BADGE_BORDER: "#ffffff",
  BUTTON_BG: "#ffffff",
  BUTTON_TEXT: "#28a999",
  EMOJI_COLOR: "#ffcc66",
  BADGE_COLOR: "#38B77F",
};

interface Props {
  user: ApiUserData | null;
}

const HeaderHome: React.FC<Props> = ({ user }) => {
  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.nameText}>Olá, {user?.nome?.split(" ")[0]}</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusBadge} />
          <Text style={styles.status}>{user?.status}</Text>
        </View>
      </View>
      <InfoBalance user={user || null} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(tabs)/payments")}
      >
        <Text style={{ fontSize: 15, marginRight: 10 }}>💰</Text>
        <Text style={styles.buttonText}>Pagar agora</Text>
        <Fontisto name="arrow-right-l" size={20} color={"#0F766E"} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_LIGHT,
  },
  statusContainer: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.568)",
    backgroundColor: "rgba(255, 255, 255, 0.288)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.BADGE_COLOR,
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.BADGE_BORDER,
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: COLORS.BUTTON_BG,
    borderWidth: 1,
    borderColor: COLORS.BUTTON_TEXT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F766E",
  },
});

export default HeaderHome;
