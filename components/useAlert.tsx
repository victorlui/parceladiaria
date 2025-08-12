import { AlertComponent } from "@/components/AlertDialog";
import { router } from "expo-router";
import React, { useState } from "react";

export function useAlerts() {
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onPress?: () => void; // Adicionamos a ação customizada aqui
  } | null>(null);

  const showSuccess = (title: string, message: string, onOkPress?: () => void) => {
    setAlert({ type: "success", title, message, onPress: onOkPress });
  };

  const showError = (title: string, message: string) => {
    setAlert({ type: "error", title, message, onPress: () => hideAlert() });
  };

  const showWarning = (title: string, message: string) => {
    setAlert({ type: "warning", title, message, onPress: () => hideAlert() });
  };

  const showInfo = (title: string, message: string) => {
    setAlert({ type: "info", title, message, onPress: () => hideAlert() });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const AlertDisplay = () => {
    if (!alert) {
      return null;
    }

    // Ação padrão do botão se nenhuma for fornecida
    const handlePress = alert.onPress || hideAlert;

    return (
      <AlertComponent
        type={alert.type}
        title={alert.title}
        message={alert.message}
        buttonText="Ok"
        onPress={handlePress}
      />
    );
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AlertDisplay,
    hideAlert,
  };
}