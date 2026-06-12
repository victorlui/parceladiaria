import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";

export function useLiveUpdate() {
  const { isUpdatePending, isChecking, isDownloading } = Updates.useUpdates();
  const alertShown = useRef(false);
  const lastChecked = useRef<number>(0);

  // Guardamos o status atualizado em um Ref
  const statusRef = useRef({ isChecking, isDownloading, isUpdatePending });

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
              await Updates.reloadAsync();
            },
          },
        ],
        { cancelable: false },
      );
    }
  }, [isUpdatePending]);

  // 2. Controle de checagem inteligente (Intervalo + AppState)
  useEffect(() => {
    const CHECK_INTERVAL_MS = 1000 * 30; // 5 minutos

    async function fetchUpdate() {
      if (AppState.currentState !== "active") return;

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

        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch (error) {
        console.log("Erro no LiveUpdate:", error);
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
