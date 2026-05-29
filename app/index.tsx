import { useNavigationFlow } from "@/hooks/useNavigationFlow";
import PulsingImageLoader from "@/pages/register/components/PulsingImageLoader";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

import { View } from "react-native";

export default function Index() {
  const { user, restoreToken, isLoading: authLoading } = useAuthStore();
  const {
    data: leadUser,
    token: leadToken,
    etapa: leadEtapa,
    hydrated: registerHydrated,
  } = useRegisterStore();
  const { handleFlow } = useNavigationFlow();
  const { pendingRoute, setPendingRoute } = useNotificationsStore();

  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const isLoading = authLoading || !registerHydrated;

  useEffect(() => {
    restoreToken();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      let path = "/login";
      if (user) {
        path =
          pendingRoute ||
          handleFlow(user.type || "client", user.etapa, user.status);
      } else if (leadUser && leadToken) {
        path =
          pendingRoute ||
          handleFlow(
            leadUser.type || "lead",
            leadUser.etapa || leadEtapa,
            leadUser.status,
          );
      }

      if (pendingRoute) {
        setPendingRoute(null);
      }

      setRedirectPath(path);
    }
  }, [
    isLoading,
    user,
    leadUser,
    leadToken,
    leadEtapa,
    handleFlow,
    pendingRoute,
    setPendingRoute,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <PulsingImageLoader source={require("@/assets/images/logo-verde.png")} />
      {!isLoading && redirectPath && <Redirect href={redirectPath as any} />}
    </View>
  );
}
