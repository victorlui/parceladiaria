import { useNavigationFlow } from "@/hooks/useNavigationFlow";
import PulsingImageLoader from "@/pages/register/components/PulsingImageLoader";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

import { View } from "react-native";

export default function Index() {
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

  const isReady = authHydrated && !authLoading && registerHydrated;

  // ========================================
  // 🚀 INICIAR RESTAURAÇÃO DO TOKEN
  // ========================================
  useEffect(() => {
    restoreToken().finally(() => {
      setIsInitializing(false);
    });
  }, [restoreToken]);

  // ========================================
  // 🔀 LÓGICA DE REDIRECIONAMENTO
  // ========================================
  useEffect(() => {
    // Só calcula redirecionamento quando estiver pronto
    if (!isReady || isInitializing) {
      return;
    }

    const pendingRoute = useNotificationsStore.getState().pendingRoute;

    let path = "/login";

    // ========================================
    // SE TEM USUÁRIO E TOKEN DO AUTH
    // ========================================
    if (authUser && authToken) {
      path =
        pendingRoute ||
        handleFlow(authUser.type || "client", authUser.etapa, authUser.status);
    }
    // ========================================
    // SE TEM USUÁRIO E TOKEN DO REGISTER (LEAD)
    // ========================================
    else if (leadUser && leadToken) {
      path =
        pendingRoute ||
        handleFlow(
          leadUser.type || "lead",
          leadUser.etapa || leadEtapa,
          leadUser.status,
        );
    }
    // ========================================
    // SE NÃO TEM NENHUM TOKEN
    // ========================================
    else {
      // Se tinha pending route, limpa
      if (pendingRoute) {
        setPendingRoute(null);
      }

      path = "/login";
    }

    // ========================================
    // LIMPA PENDING ROUTE SE EXISTIR
    // ========================================
    if (pendingRoute) {
      setPendingRoute(null);
    }

    setRedirectPath(path);
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
