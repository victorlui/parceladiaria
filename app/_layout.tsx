import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { QueryClientProvider } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { StatusCadastro } from "@/utils";

export default function RootLayout() {
  const { restoreToken, token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restaurar token ao iniciar
  useEffect(() => {
    const restore = async () => {
      await restoreToken();
      setLoading(false);
    };
    restore();
  }, [restoreToken]);

  // Redirecionar conforme status do usuário
  useEffect(() => {
    if (loading) return; // Evita rodar antes do restoreToken terminar

    if (!token || !user) {
      router.replace("/login"); // Redireciona para login se não estiver logado
      return;
    }


    if(user.type === 'client') {
      router.replace("/(app)/home");
    }else{
        switch (user.status) {
      case StatusCadastro.ANALISE:
        router.replace("/analise_screen");
        break;
      case StatusCadastro.RECUSADO:
        router.replace("/recusado_screen");
        break;
      case StatusCadastro.DIVERGENTE:
        router.replace("/divergencia_screen");
        break;
      case StatusCadastro.PRE_APROVADO:
        router.replace("/pre_aprovado_screen");
        break;
     
    }
    }

  
  }, [loading, token, user, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator color={"red"} size={50} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
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
