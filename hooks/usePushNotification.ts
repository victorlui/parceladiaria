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
        console.log("[NOTIF] 📲 Usuário clicou em notificação");

        // Verifica estado de hidratação de AMBAS as stores
        const registerState = useRegisterStore.getState();
        const authState = useAuthStore.getState();
        const notificationsState = useNotificationsStore.getState();

        const isAppReady =
          !authState.isLoading &&
          registerState.hydrated;

        console.log("[NOTIF] Estado da app:", {
          authLoading: authState.isLoading,
          registerHydrated: registerState.hydrated,
          isAppReady,
        });

        if (isAppReady) {
          console.log("[NOTIF] ✅ App pronta, navegando para /login");
          // Pequeno delay para garantir que a navegação e o Zustand não entrem em conflito
          setTimeout(() => {
            router.push("/login");
          }, 100);
        } else {
          console.log("[NOTIF] ⏳ App ainda carregando, guardando pending route");
          // Guarda a rota para o redirecionamento pós-carregamento no index.tsx
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
      console.log("[NOTIF] Push notifications desabilitado");
      return;
    }

    const checkAndRegister = async () => {
      // Se já estamos mostrando um alerta, não faça nada para evitar loops
      if (isAlertShown.current) return;

      console.log("[NOTIF] Verificando permissões de notificação...");

      const { setPushToken } = useNotificationsStore.getState();
      const { status: existingStatus } =
        await Notification.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        console.log("[NOTIF] Permissão não concedida, solicitando...");
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
        console.log("[NOTIF] Obtendo token Expo Push...");
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

        console.log("[NOTIF] ✅ Token obtido:", token.substring(0, 20) + "...");
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
        console.log("[NOTIF] App voltou para primeiro plano, verificando token...");
        checkAndRegister();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [disabled]);
}
