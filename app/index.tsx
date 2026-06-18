import { useNavigationFlow } from "@/hooks/useNavigationFlow";
import PulsingImageLoader from "@/pages/register/components/PulsingImageLoader";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

import { View } from "react-native";

export default function Index() {
  console.log("[INDEX] ====================================");
  console.log("[INDEX] TELA DE INICIALIZAÇÃO");
  console.log("[INDEX] ====================================");

  // ========================================
  // 🎯 ACESSA STORE DE AUTENTICAÇÃO
  // ========================================
  const {
    user: authUser,
    token: authToken,
    hasHydrated: authHydrated,
    isLoading: authLoading,
    restoreToken,
  } = useAuthStore();

  // ========================================
  // 🎯 ACESSA STORE DE REGISTRO
  // ========================================
  const {
    data: leadUser,
    token: leadToken,
    etapa: leadEtapa,
    hydrated: registerHydrated,
  } = useRegisterStore();

  const { handleFlow } = useNavigationFlow();
  const { setPendingRoute } = useNotificationsStore();

  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // ========================================
  // 🔄 ESTADO DE CARREGAMENTO GLOBAL
  // ========================================
  // Só está pronto quando:
  // 1. Auth store hidratou E
  // 2. Register store hidratou E
  // 3. Não está mais carregando
  const isReady =
    authHydrated &&
    !authLoading &&
    registerHydrated;

  console.log("[INDEX] Estado de carregamento:");
  console.log("[INDEX] - Auth hidratado:", authHydrated);
  console.log("[INDEX] - Auth loading:", authLoading);
  console.log("[INDEX] - Register hidratado:", registerHydrated);
  console.log("[INDEX] - Pronto:", isReady);

  // ========================================
  // 🚀 INICIAR RESTAURAÇÃO DO TOKEN
  // ========================================
  useEffect(() => {
    console.log("[INDEX] Iniciando restauração de token...");

    // Chama restoreToken uma única vez quando o componente monta
    // A store vai cuidar da hidratação assíncrona
    restoreToken().finally(() => {
      console.log("[INDEX] Restauração de token concluída");
      setIsInitializing(false);
    });
  }, [restoreToken]);

  // ========================================
  // 🔀 LÓGICA DE REDIRECIONAMENTO
  // ========================================
  useEffect(() => {
    // Só calcula redirecionamento quando estiver pronto
    if (!isReady || isInitializing) {
      console.log("[INDEX] Aguardando para calcular redirect...");
      return;
    }

    console.log("[INDEX] Calculando redirecionamento...");
    console.log("[INDEX] Auth user:", !!authUser);
    console.log("[INDEX] Auth token:", !!authToken);
    console.log("[INDEX] Lead user:", !!leadUser);
    console.log("[INDEX] Lead token:", !!leadToken);

    const pendingRoute = useNotificationsStore.getState().pendingRoute;

    let path = "/login";

    // ========================================
    // SE TEM USUÁRIO E TOKEN DO AUTH
    // ========================================
    if (authUser && authToken) {
      console.log("[INDEX] ✅ Usuário autenticado via AUTH");

      path =
        pendingRoute ||
        handleFlow(authUser.type || "client", authUser.etapa, authUser.status);

      console.log("[INDEX] ✅ Redirect para (AUTH):", path);
    }
    // ========================================
    // SE TEM USUÁRIO E TOKEN DO REGISTER (LEAD)
    // ========================================
    else if (leadUser && leadToken) {
      console.log("[INDEX] ✅ Usuário em modo REGISTER (LEAD)");

      path =
        pendingRoute ||
        handleFlow(
          leadUser.type || "lead",
          leadUser.etapa || leadEtapa,
          leadUser.status,
        );

      console.log("[INDEX] ✅ Redirect para (LEAD):", path);
    }
    // ========================================
    // SE NÃO TEM NENHUM TOKEN
    // ========================================
    else {
      console.log("[INDEX] ❌ Nenhum token encontrado");

      // Se tinha pending route, limpa
      if (pendingRoute) {
        console.log("[INDEX] ❌ Limpando pending route");
        setPendingRoute(null);
      }

      path = "/login";
      console.log("[INDEX] ❌ Redirect para LOGIN");
    }

    // ========================================
    // LIMPA PENDING ROUTE SE EXISTIR
    // ========================================
    if (pendingRoute) {
      console.log("[INDEX] 🧹 Limpando pending route");
      setPendingRoute(null);
    }

    // ========================================
    // DEFINE CAMINHO DE REDIRECT
    // ========================================
    console.log("[INDEX] 📍 Caminho final:", path);
    setRedirectPath(path);

    console.log("[INDEX] ====================================");
  }, [
    isReady,
    isInitializing,
    authUser,
    authToken,
    leadUser,
    leadToken,
    leadEtapa,
    handleFlow,
    setPendingRoute,
  ]);

  // ========================================
  // 🎨 RENDERIZAÇÃO
  // ========================================
  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <PulsingImageLoader source={require("@/assets/images/logo-verde.png")} />

      {/* Só mostra redirect quando estiver pronto */}
      {isReady && redirectPath && (
        <>
          <Redirect href={redirectPath as any} />
        </>
      )}
    </View>
  );
}
