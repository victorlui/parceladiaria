import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import "react-native-reanimated";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import "../global.css";

export default function RootLayout() {
  const { restoreToken } = useAuthStore();

  useEffect(() => {
    const restore = async () => {
      try {
        await restoreToken();
      } catch (error) {
        console.error('Erro ao restaurar token:', error);
      } 
    };
    restore();
  }, [restoreToken]);

  

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
        <Stack.Screen name="reset_password" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
