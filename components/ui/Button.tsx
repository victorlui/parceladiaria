import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoadingDots from "./LoadingDots";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  iconRight?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

const ButtonComponent: React.FC<Props> = ({
  title,
  onPress,
  loading,
  iconRight = "arrow-forward",
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      <View style={styles.content}>
        {loading && <LoadingDots text="Aguarde..." />}
        {!loading && <Text style={styles.buttonText}>{title}</Text>}
        {!loading && iconRight && (
          <Ionicons
            name={iconRight}
            size={18}
            color={Colors.white}
            style={styles.iconRight}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.green.button,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: Colors.gray.primary,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default ButtonComponent;
