import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { Link } from "expo-router";
import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AlertType = "info" | "error" | "warning" | "success";

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
  sac?: boolean;
}

const icons = {
  error: require("@/assets/images/close.png"),
  warning: require("@/assets/images/warning.png"),
  info: require("@/assets/images/info.png"),
  success: require("@/assets/images/checked.png"),
};

export function AlertComponent({
  type,
  title,
  message,
  buttonText,
  onPress,
  sac = false,
}: AlertProps) {
  useDisableBackHandler();

  const getButtonBgColor = () => {
    switch (type) {
      case "success":
        return "#22c55e"; // bg-green-500
      case "info":
        return "#3b82f6"; // bg-blue-500
      case "warning":
        return "#eab308"; // bg-yellow-500
      default:
        return "#f87171"; // bg-red-400
    }
  };

  const icon = icons[type];

  return (
    <Modal
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Image source={icon} style={styles.icon} resizeMode="contain" />
          {title ? (
            <>
              <Text
                style={[
                  styles.title,
                  !message
                    ? styles.marginBottomLarge
                    : styles.marginBottomSmall,
                ]}
              >
                {title}
              </Text>
              {message && (
                <Text
                  style={[
                    styles.message,
                    sac ? styles.marginBottomMedium : styles.marginBottomLarge,
                  ]}
                >
                  {message}
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.message, styles.marginBottomLarge]}>
              {message}
            </Text>
          )}
          {sac && (
            <Link
              href="https://www.parceladiaria.com.br/sac"
              style={styles.sacLink}
            >
              Clicando aqui
            </Link>
          )}

          <TouchableOpacity
            onPress={onPress}
            style={[styles.button, { backgroundColor: getButtonBgColor() }]}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    padding: 24,
    borderRadius: 12,
    width: 288, // w-72 (72 * 4 = 288)
    backgroundColor: "#ffffff", // bg-white
    alignItems: "center",
    // shadow-md
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    width: 64, // w-16
    height: 64, // h-16
    marginBottom: 16,
  },
  title: {
    fontSize: 19, // text-xl
    fontWeight: "bold",
    color: "#000000",
    alignItems: "center",
  },
  message: {
    color: "#4b5563", // text-gray-600
    textAlign: "center",
  },
  marginBottomSmall: {
    marginBottom: 8, // mb-2
  },
  marginBottomMedium: {
    marginBottom: 12, // mb-3
  },
  marginBottomLarge: {
    marginBottom: 24, // mb-6
  },
  sacLink: {
    color: "#3b82f6", // text-blue-500
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
});
