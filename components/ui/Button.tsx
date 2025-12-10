import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import LoadingDots from "./LoadingDots";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  iconRight?:
    | keyof typeof Ionicons.glyphMap
    | keyof typeof FontAwesome.glyphMap
    | null;
  iconLeft?:
    | keyof typeof Ionicons.glyphMap
    | keyof typeof FontAwesome.glyphMap
    | null;
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
  const renderIcon = (iconName: string, style: any) => {
    const color = outline ? Colors.green.button : Colors.white;

    if (Object.prototype.hasOwnProperty.call(Ionicons.glyphMap, iconName)) {
      return (
        <Ionicons
          name={iconName as keyof typeof Ionicons.glyphMap}
          size={18}
          color={color}
          style={style}
        />
      );
    }
    if (Object.prototype.hasOwnProperty.call(FontAwesome.glyphMap, iconName)) {
      return (
        <FontAwesome
          name={iconName as keyof typeof FontAwesome.glyphMap}
          size={18}
          color={color}
          style={style}
        />
      );
    }
    return null;
  };

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
        {!loading && iconLeft && renderIcon(iconLeft, styles.iconLeft)}
        {loading && <LoadingDots text="Aguarde..." />}
        {!loading && (
          <Text
            style={[styles.buttonText, outline && styles.buttonTextOutline]}
          >
            {title}
          </Text>
        )}
        {!loading && iconRight && renderIcon(iconRight, styles.iconRight)}
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
