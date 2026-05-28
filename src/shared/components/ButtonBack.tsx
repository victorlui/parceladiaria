import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";

interface Props {
  onBack: () => void;
}

export default function ButtonBack({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  const backButtonStyle = useMemo(() => ({ top: 10, left: 16 }), [insets.top]);

  return (
    <Pressable
      onPress={onBack}
      style={[styles.backButton, backButtonStyle]}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={12}
    >
      <Ionicons name="chevron-back" color={Colors.white} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.green.primary,
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
