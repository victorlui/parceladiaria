import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { StatusCadastro } from "@/utils";
import "../global.css";

export default function RootLayout() {
  const { restoreToken, token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restaurar token ao iniciar
  useEffect(() => {
    const restore = async () => {
      try {
        await restoreToken();
      } catch (error) {
        console.error('Erro ao restaurar token:', error);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [restoreToken]);

  // A lógica de redirecionamento agora está no index.tsx

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <StatusBar style="dark" />
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="insert-password" options={{ headerShown: false }} />
        <Stack.Screen name="(register)" options={{ headerShown: false }} />
        <Stack.Screen name="(comerciante)" options={{ headerShown: false }} />
        <Stack.Screen name="(motorista)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="recusado_screen" options={{ headerShown: false }} />
        <Stack.Screen name="divergencia_screen" options={{ headerShown: false }} />
        <Stack.Screen name="reanalise_screen" options={{ headerShown: false }} />
        <Stack.Screen name="pre_aprovado_screen" options={{ headerShown: false }} />
        <Stack.Screen name="analise_screen" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
