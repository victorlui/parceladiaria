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

  // Redirecionar conforme status do usuário
  useEffect(() => {
    if (loading) return; // Evita rodar antes do restoreToken terminar
    
    console.log('token layout', token, user);

    if (!token && !user) {
      router.replace("/login");
      return;
    }

    // Se tiver token e user com type 'client', verificar status do cadastro
    if (user?.type === 'client') {
      // Verificar se user.status existe antes de fazer o switch
      if (!user.status) {
        router.replace("/(app)/home");
        return;
      }

      // Redirecionar baseado no status do cadastro para clients
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
        case StatusCadastro.REANALISE:
          router.replace("/reanalise_screen");
          break;
        case StatusCadastro.PRE_APROVADO:
          router.replace("/pre_aprovado_screen");
          break;
        case StatusCadastro.APROVADO:
          router.replace("/(app)/home");
          break;
        default:
          router.replace("/login");
          break;
      }
      return;
    }

    // Se tiver token e user com type 'lead', verificar status do cadastro
  

    // Se tiver token e user (sem type específico ou outro type), deixar passar
    // Não faz verificação de status, apenas permite acesso
  }, [loading, token, user, router]);

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
