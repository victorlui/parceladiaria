import { AlertComponent } from "@/components/AlertDialog";
import React from "react";
import { create } from "zustand";

type AlertType = "success" | "error" | "warning" | "info";

type AlertData = {
  type: AlertType;
  title: string;
  message: string;
  onPress?: () => void;
  sac?: boolean;
};

type AlertStore = {
  alert: AlertData | null;
  showSuccess: (title: string, message: string, onOkPress?: () => void) => void;
  showError: (
    title: string,
    message: string,
    sac?: boolean,
    onOkPress?: () => void,
  ) => void;
  showWarning: (title: string, message: string, onPress?: () => void) => void;
  showWarningPress: (
    title: string,
    message: string,
    onOkPress?: () => void,
  ) => void;
  showInfo: (title: string, message: string) => void;
  hideAlert: () => void;
};

const useAlertStore = create<AlertStore>((set) => ({
  alert: null,
  showSuccess: (title, message, onOkPress) =>
    set({
      alert: {
        type: "success",
        title,
        message,
        onPress: onOkPress,
        sac: false,
      },
    }),
  showError: (title, message, sac, onOkPress) =>
    set({
      alert: {
        type: "error",
        title,
        message,
        sac,
        onPress: onOkPress,
      },
    }),
  showWarning: (title, message, onPress) =>
    set({
      alert: {
        type: "warning",
        title,
        message,
        onPress,
      },
    }),
  showWarningPress: (title, message, onOkPress) =>
    set({
      alert: {
        type: "warning",
        title,
        message,
        onPress: onOkPress,
      },
    }),
  showInfo: (title, message) =>
    set({
      alert: {
        type: "info",
        title,
        message,
      },
    }),
  hideAlert: () => set({ alert: null }),
}));

export function useAlerts() {
  const alert = useAlertStore((s) => s.alert);
  const showSuccess = useAlertStore((s) => s.showSuccess);
  const showError = useAlertStore((s) => s.showError);
  const showWarning = useAlertStore((s) => s.showWarning);
  const showWarningPress = useAlertStore((s) => s.showWarningPress);
  const showInfo = useAlertStore((s) => s.showInfo);
  const hideAlert = useAlertStore((s) => s.hideAlert);

  const AlertDisplay = React.useCallback(() => {
    if (!alert) return null;

    const handlePress = () => {
      const onPress = alert.onPress;
      hideAlert();
      onPress?.();
    };

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
  }, [alert, hideAlert]);

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
