import { AlertComponent } from "@/components/AlertDialog";
import React, { useState } from "react";

export function useAlerts() {
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onPress?: () => void; // Adicionamos a ação customizada aqui
    sac?: boolean;
  } | null>(null);

  const showSuccess = (
    title: string,
    message: string,
    onOkPress?: () => void,
  ) => {
    setAlert({
      type: "success",
      title,
      message,
      onPress: onOkPress,
      sac: false,
    });
  };

  const showError = (title: string, message: string, sac?: boolean) => {
    setAlert({
      type: "error",
      title,
      message,
      onPress: () => hideAlert(),
      sac,
    });
  };

  const showWarning = (
    title: string,
    message: string,
    onPress?: () => void,
  ) => {
    setAlert({
      type: "warning",
      title,
      message,
      onPress: onPress || hideAlert,
    });
  };

  const showWarningPress = (
    title: string,
    message: string,
    onOkPress?: () => void,
  ) => {
    setAlert({ type: "warning", title, message, onPress: onOkPress });
  };

  const showInfo = (title: string, message: string) => {
    setAlert({ type: "info", title, message, onPress: () => hideAlert() });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const AlertDisplay = React.useCallback(() => {
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
        sac={alert.sac}
      />
    );
  }, [alert]);

  return {
    showSuccess,
    showError,
    showWarning,
    showWarningPress,
    showInfo,
    AlertDisplay,
    hideAlert,
  };
}
