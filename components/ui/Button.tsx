import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoadingDots from "./LoadingDots";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  iconRight?: keyof typeof Ionicons.glyphMap | null;
  iconLeft?: keyof typeof Ionicons.glyphMap | null;
  disabled?: boolean;
  outline?: boolean;
}

const ButtonComponent: React.FC<Props> = ({
  title,
  onPress,
  loading,
  iconRight = "arrow-forward",
  iconLeft = "arrow-back",
  disabled = false,
  outline = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        outline && styles.buttonOutline,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      <View style={styles.content}>
        {!loading && iconLeft && (
          <Ionicons
            name={iconLeft}
            size={18}
            color={outline ? Colors.green.button : Colors.white}
            style={styles.iconLeft}
          />
        )}
        {loading && <LoadingDots text="Aguarde..." />}
        {!loading && (
          <Text
            style={[styles.buttonText, outline && styles.buttonTextOutline]}
          >
            {title}
          </Text>
        )}
        {!loading && iconRight && (
          <Ionicons
            name={iconRight}
            size={18}
            color={outline ? Colors.green.button : Colors.white}
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
  buttonOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.green.button,
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
  buttonTextOutline: {
    color: Colors.green.button,
  },
  iconRight: {
    marginLeft: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
});

export default ButtonComponent;
