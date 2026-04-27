import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { Alert, AppState } from "react-native";

export function useLiveUpdate() {
  // Usamos um ref para evitar múltiplas chamadas simultâneas se a rede estiver lenta
  const isChecking = useRef(false);

  useEffect(() => {
    const CHECK_INTERVAL_MS = 1000 * 60 * 5;
    const CHECK_TIMEOUT_MS = 1000 * 20;

    function withTimeout<T>(promise: Promise<T>, ms: number) {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("LiveUpdate timeout"));
        }, ms);
      });

      return Promise.race([promise, timeoutPromise]).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
      }) as Promise<T>;
    }

    async function fetchUpdate() {
      console.log("Verificando atualizações no servidor...");

      if (AppState.currentState !== "active") return;

      // Se já estiver checando, ignora esta rodada do intervalo
      if (isChecking.current) return;

      if (__DEV__ || !Updates.isEnabled) {
        console.log(
          `LiveUpdate desabilitado (DEV=${String(__DEV__)}, enabled=${String(
            Updates.isEnabled,
          )})`,
        );
        return;
      }

      try {
        isChecking.current = true;

        // 1. Verifica se há algo novo no servidor do Expo
        const update = await withTimeout(
          Updates.checkForUpdateAsync(),
          CHECK_TIMEOUT_MS,
        );

        if (update.isAvailable) {
          console.log("Update encontrado! Baixando...");

          // 2. Baixa o código novo em segundo plano
          await withTimeout(Updates.fetchUpdateAsync(), CHECK_TIMEOUT_MS);

          // 3. Avisa o usuário IMEDIATAMENTE
          Alert.alert(
            "Novas funções disponíveis!",
            "Acabamos de lançar uma melhoria. Deseja aplicar agora?",
            [
              {
                text: "Atualizar Agora",
                onPress: async () => {
                  // Reinicia o app já com o código novo
                  await Updates.reloadAsync();
                },
              },
            ],
            { cancelable: false }, // Garante que o usuário veja o alerta
          );
        }
      } catch (error) {
        console.log("Erro ao buscar update:", error);
      } finally {
        isChecking.current = false;
      }
    }

    // Verifica quando o app volta para o primeiro plano (foreground)
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        fetchUpdate();
      }
    });

    // Verifica em intervalo seguro para produção (5 minutos)
    const interval = setInterval(() => {
      fetchUpdate();
    }, CHECK_INTERVAL_MS);

    // Executa uma vez logo que o hook é montado
    fetchUpdate();

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);
}
