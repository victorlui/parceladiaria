import * as Notification from "expo-notifications";
import * as Linking from "expo-linking";
import { Alert, AppState } from "react-native";
import Constants from "expo-constants";
import { useNotificationsStore } from "@/store/notifications";
import { useEffect, useRef } from "react";

export function usePushNotification(options?: { disabled?: boolean }) {
  const appState = useRef(AppState.currentState);
  const isAlertShown = useRef(false);
  const disabled = options?.disabled;

  useEffect(() => {
    if (disabled) {
      return;
    }

    const checkAndRegister = async () => {
      // Se já estamos mostrando um alerta, não faça nada para evitar loops
      if (isAlertShown.current) return;

      const { setPushToken } = useNotificationsStore.getState();
      const { status: existingStatus } =
        await Notification.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notification.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        isAlertShown.current = true;
        Alert.alert(
          "As notificações estão desativadas.",
          "Para receber alertas importantes, ative as notificações nas configurações do aplicativo.",
          [
            {
              text: "OK",
              onPress: () => {
                isAlertShown.current = false;
                Linking.openSettings();
              },
            },
          ],
          { cancelable: false },
        );
        return;
      }

      const isDev = __DEV__;

      try {
        const token = (
          await Notification.getExpoPushTokenAsync(
            isDev
              ? undefined
              : {
                  projectId:
                    Constants.easConfig?.projectId ||
                    Constants.expoConfig?.extra?.eas?.projectId,
                },
          )
        ).data;
        setPushToken(token);
      } catch (error) {
        console.log("Erro ao pegar token:", error);
      }
    };

    checkAndRegister();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkAndRegister();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [disabled]);
}
