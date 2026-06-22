import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as Notification from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

// Configuração do handler de notificações para exibir alertas em foreground (primeiro plano)
Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotification(options?: { disabled?: boolean }) {
  const appState = useRef(AppState.currentState);
  const isAlertShown = useRef(false);
  const disabled = options?.disabled;

  // ============================================
  // 🎯 LIDA COM CLIQUE EM NOTIFICAÇÃO
  // ============================================
  useEffect(() => {
    const responseListener =
      Notification.addNotificationResponseReceivedListener(() => {
        // Verifica estado de hidratação de AMBAS as stores
        const registerState = useRegisterStore.getState();
        const authState = useAuthStore.getState();
        const notificationsState = useNotificationsStore.getState();

        const isAppReady = !authState.isLoading && registerState.hydrated;

        if (isAppReady) {
          setTimeout(() => {
            router.push("/login");
          }, 100);
        } else {
          notificationsState.setPendingRoute("/login");
        }
      });

    return () => {
      responseListener.remove();
    };
  }, []);

  // ============================================
  // 📱 REGISTRA TOKEN DE PUSH
  // ============================================
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
              text: "Agora não",
              style: "cancel",
              onPress: () => {
                isAlertShown.current = false;
              },
            },
            {
              text: "Configurações",
              onPress: () => {
                isAlertShown.current = false;
                Linking.openSettings();
              },
            },
          ],
          { cancelable: true },
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
        console.error("[NOTIF] ❌ Erro ao obter token:", error);
        return error;
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
