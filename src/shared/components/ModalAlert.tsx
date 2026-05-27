import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";

export type ModalAlertType = "success" | "error" | "warning";

export interface ModalAlertProps {
  visible: boolean;
  type: ModalAlertType;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
}

const { width } = Dimensions.get("window");

export default function ModalAlert({
  visible,
  type,
  title,
  message,
  onClose,
  confirmText = "OK",
}: ModalAlertProps) {
  const scaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleValue.setValue(0.8);
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [visible]);

  const getIconInfo = () => {
    switch (type) {
      case "success":
        return {
          name: "checkmark-circle",
          color: Colors.green.secondary || "#10B981",
        };
      case "error":
        return {
          name: "close-circle",
          color: "#EF4444", // Vermelho forte
        };
      case "warning":
        return {
          name: "warning",
          color: Colors.orange.primary || "#F59E0B",
        };
      default:
        return {
          name: "information-circle",
          color: Colors.blue?.primary || "#3B82F6",
        };
    }
  };

  const { name, color } = getIconInfo();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Icon Header */}
          <View style={styles.iconContainer}>
            <Ionicons name={name as any} size={72} color={color} />
          </View>

          {/* Texts */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: color }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{confirmText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: Colors.gray.text,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
