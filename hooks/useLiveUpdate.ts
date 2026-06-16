import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";

import { AnalyticsService } from "@/analytics/analytics.service";

// Global lock to prevent concurrent update operations
let updateInProgress = false;

export function useLiveUpdate() {
  const { isUpdatePending, isChecking, isDownloading } = Updates.useUpdates();
  const alertShown = useRef(false);
  const lastChecked = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Guardamos o status atualizado em um Ref
  const statusRef = useRef({ isChecking, isDownloading, isUpdatePending });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    statusRef.current = { isChecking, isDownloading, isUpdatePending };

    // Se o update deixar de estar pendente (ex: foi aplicado), liberamos o alerta para o próximo update
    if (!isUpdatePending) {
      alertShown.current = false;
    }
  }, [isChecking, isDownloading, isUpdatePending]);

  // 1. Dispara o Alerta quando o update está pronto
  useEffect(() => {
    if (isUpdatePending && !alertShown.current) {
      alertShown.current = true;

      Alert.alert(
        "Novas funções disponíveis!",
        "Acabamos de lançar uma melhoria. Deseja aplicar agora?",
        [
          {
            text: "Atualizar Agora",
            onPress: async () => {
              if (updateInProgress) return;
              updateInProgress = true;

              try {
                await Updates.reloadAsync();
              } catch (error) {
                AnalyticsService.error(
                  error instanceof Error
                    ? error
                    : new Error(String(error)),
                  { source: "useLiveUpdate", action: "reload" },
                );
              } finally {
                updateInProgress = false;
              }
            },
          },
        ],
        { cancelable: false },
      );
    }
  }, [isUpdatePending]);

  // 2. Controle de checagem inteligente (Intervalo + AppState)
  useEffect(() => {
    const CHECK_INTERVAL_MS = 1000 * 30; // 30 segundos

    async function fetchUpdate() {
      if (!isMountedRef.current) return;
      if (AppState.currentState !== "active") return;
      if (updateInProgress) return;

      if (__DEV__ || !Updates.isEnabled) {
        return;
      }

      const status = statusRef.current;
      if (status.isChecking || status.isDownloading || status.isUpdatePending) {
        return;
      }

      try {
        // Atualiza o timestamp imediatamente para evitar que múltiplos gatilhos rápidos disparem juntos
        lastChecked.current = Date.now();

        AnalyticsService.track("Checking update", {
          source: "useLiveUpdate",
        });

        const update = await Updates.checkForUpdateAsync();

        if (!isMountedRef.current) return;

        if (update.isAvailable) {
          AnalyticsService.track("Update available", {
            source: "useLiveUpdate",
          });

          await Updates.fetchUpdateAsync();
        }
      } catch (error) {
        console.log("Erro no LiveUpdate:", error);

        AnalyticsService.error(
          error instanceof Error ? error : new Error(String(error)),
          { source: "useLiveUpdate", action: "checkUpdate" },
        );
      }
    }

    // Valida se realmente passou o tempo necessário (Resolve o congelamento do iOS)
    function handleCheckRequirements() {
      const now = Date.now();
      if (now - lastChecked.current >= CHECK_INTERVAL_MS) {
        fetchUpdate();
      }
    }

    // Listener para quando o app volta do background
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          handleCheckRequirements();
        }
      },
    );

    // Intervalo contínuo caso o usuário fique com o app aberto direto
    const interval = setInterval(() => {
      handleCheckRequirements();
    }, CHECK_INTERVAL_MS);

    // Aguarda 5 segundos na primeira montagem para o ON_LOAD nativo trabalhar livremente
    const initialTimeout = setTimeout(() => {
      fetchUpdate();
    }, 5000);

    return () => {
      subscription.remove();
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);
}
