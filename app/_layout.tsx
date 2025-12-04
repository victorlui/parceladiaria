import { router, Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import "../global.css";
import { ActivityIndicator, Alert, View } from "react-native";
import { StatusCadastro } from "@/utils";
import { useAlerts } from "@/components/useAlert";
import * as Updates from "expo-updates";

export default function RootLayout() {
  const { restoreToken, isLoading, user, token } = useAuthStore();
  const { AlertDisplay } = useAlerts();

  useEffect(() => {
    async function checkUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Atualização disponível",
            "O app será reiniciado para aplicar as novas alterações.",
            [
              {
                text: "OK",
                onPress: () => Updates.reloadAsync(),
              },
            ]
          );
        }
      } catch (e) {
        console.log("Erro ao buscar update", e);
      }
    }

    checkUpdate();
  }, []);

  useEffect(() => {
    const restore = async () => {
      try {
        await restoreToken();
      } catch (error) {
        console.error("Erro ao restaurar token:", error);
      }
    };
    restore();
  }, [restoreToken]);

  const statusRedirectMap = useMemo(
    () => ({
      [StatusCadastro.ANALISE]: "/analise_screen",
      [StatusCadastro.RECUSADO]: "/recusado_screen",
      [StatusCadastro.DIVERGENTE]: "/divergencia_screen",
      [StatusCadastro.REANALISE]: "/reanalise_screen",
      [StatusCadastro.PRE_APROVADO]: "/pre_aprovado_screen",
      [StatusCadastro.APROVADO]: "/(tabs)",
    }),
    []
  );

  useEffect(() => {
    if (isLoading) return;

    console.log("isLoading:", isLoading, "token:", token, "user:", user);

    if (!token && !user) {
      router.replace("/login");
      return;
    }

    if (user?.isLoggedIn) {
      const route =
        !user.status || !(user.status in statusRedirectMap)
          ? "/(tabs)"
          : statusRedirectMap[user.status as keyof typeof statusRedirectMap];

      router.replace(route as Parameters<typeof router.replace>[0]);
      //   router.replace("/analise_screen");
      return;
    }
  }, [isLoading, token, user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    // enquanto o token não for restaurado, não renderiza nada que faça requisições
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AlertDisplay />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />

        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="insert-password" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />

        <Stack.Screen name="(register)" options={{ headerShown: false }} />
        <Stack.Screen name="(register_new)" options={{ headerShown: false }} />

        <Stack.Screen name="(comerciante)" options={{ headerShown: false }} />
        <Stack.Screen name="(motorista_new)" options={{ headerShown: false }} />

        <Stack.Screen name="recusado_screen" options={{ headerShown: false }} />
        <Stack.Screen
          name="divergencia_screen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="reanalise_screen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="pre_aprovado_screen"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="analise_screen" options={{ headerShown: false }} />
        <Stack.Screen name="reset_password" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
