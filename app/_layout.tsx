import { useAlerts } from "@/components/useAlert";
import { useForceInAppUpdate } from "@/hooks/useInAppUpdate";
import { useLiveUpdate } from "@/hooks/useLiveUpdate";
import { usePushNotification } from "@/hooks/usePushNotification";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { StatusCadastro } from "@/utils";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, router, usePathname } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import "../global.css";

const PUBLIC_ROUTES = [
  "/login",
  "/insert-password",

  // register
  "/step1",
  "/openfinance",
  "/termos",

  // auth
  "/change-password-screen",
  "/cpf-otp-screen",
  "/otp-screen",

  "/verification",

  "/divergencia_screen",
];

export default function RootLayout() {
  const pathname = usePathname() ?? "";

  const { restoreToken, isLoading, user, token } = useAuthStore();

  const { AlertDisplay } = useAlerts();

  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  const [didRestoreToken, setDidRestoreToken] = useState(false);

  const pendingNotificationRouteRef = useRef<string | null>(null);

  const didRestoreTokenRef = useRef(false);

  const lastHandledNotificationKeyRef = useRef<string | null>(null);

  useLiveUpdate();

  useForceInAppUpdate();

  usePushNotification({ disabled: isLoading });

  useEffect(() => {
    didRestoreTokenRef.current = didRestoreToken;
  }, [didRestoreToken]);

  // =========================================================
  // NORMALIZA DEEPLINK
  // =========================================================

  const normalizeNotificationRoute = useCallback((url: unknown) => {
    if (typeof url !== "string") return null;

    const TAB_ROUTES = [
      "home",
      "loans",
      "payments",
      "profile",
      "config",
      "renew",
      "renew_list",
    ];

    const withoutScheme = url.replace(/^parceladiaria:\/*/i, "");

    const [pathPart, queryPart] = withoutScheme.split("?");

    const pathOnly = (pathPart ?? "").split("#")[0] ?? "";

    const withLeadingSlash = pathOnly.startsWith("/")
      ? pathOnly
      : `/${pathOnly}`;

    const collapsedSlashes = withLeadingSlash.replace(/\/{2,}/g, "/");

    const normalized =
      queryPart && queryPart.length > 0
        ? `${collapsedSlashes}?${queryPart}`
        : collapsedSlashes;

    const firstSegment = normalized.split("?")[0].split("#")[0].split("/")[1];

    if (firstSegment && TAB_ROUTES.includes(firstSegment)) {
      return `/(tabs)${normalized}`;
    }

    return normalized;
  }, []);

  // =========================================================
  // REDIRECT NOTIFICATION
  // =========================================================

  const handleNotificationRoute = useCallback(async (route: string) => {
    // espera restoreToken terminar
    if (!didRestoreTokenRef.current) {
      pendingNotificationRouteRef.current = route;
      return;
    }

    const { token: currentToken, user: currentUser } = useAuthStore.getState();

    const isLogged = !!currentToken && !!currentUser?.isLoggedIn;

    // ❌ usuário não logado
    if (!isLogged) {
      // vai login
      router.replace("/login");

      return;
    }

    // ✅ usuário logado
    router.push(route as any);
  }, []);

  // =========================================================
  // CONFIG GLOBAL NOTIFICATION
  // =========================================================

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  // =========================================================
  // PROCESSA PENDENTE APÓS RESTORE
  // =========================================================

  useEffect(() => {
    if (!didRestoreToken) return;

    if (!pendingNotificationRouteRef.current) return;

    const route = pendingNotificationRouteRef.current;

    pendingNotificationRouteRef.current = null;

    handleNotificationRoute(route);
  }, [didRestoreToken, handleNotificationRoute]);

  // =========================================================
  // CLICK NOTIFICATION
  // =========================================================

  useEffect(() => {
    if (!lastNotificationResponse) return;

    const key =
      `${lastNotificationResponse.notification.request.identifier}:` +
      `${lastNotificationResponse.actionIdentifier}`;

    if (key === lastHandledNotificationKeyRef.current) {
      return;
    }

    lastHandledNotificationKeyRef.current = key;

    const url = lastNotificationResponse.notification.request.content.data?.url;

    const route = normalizeNotificationRoute(url);

    if (route) {
      handleNotificationRoute(route);
    }
  }, [
    handleNotificationRoute,
    lastNotificationResponse,
    normalizeNotificationRoute,
  ]);

  // =========================================================
  // CANAL ANDROID
  // =========================================================

  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Notificações",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }, []);

  // =========================================================
  // RESTORE TOKEN
  // =========================================================

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        await restoreToken();
      } catch (e) {
        console.error("Erro restoreToken:", e);
      } finally {
        if (isActive) {
          setDidRestoreToken(true);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [restoreToken]);

  // =========================================================
  // MAP STATUS
  // =========================================================

  const statusRedirectMap = useMemo(
    () => ({
      [StatusCadastro.ANALISE]: "/analise_screen",
      [StatusCadastro.RECUSADO]: "/recusado_screen",
      [StatusCadastro.DIVERGENTE]: "/divergencia_screen",
      [StatusCadastro.REANALISE]: "/reanalise_screen",
      [StatusCadastro.PRE_APROVADO]: "/pre_aprovado_screen",
      [StatusCadastro.APROVADO]: "/(tabs)",
    }),
    [],
  );

  const isBootstrapping = isLoading || !didRestoreToken;

  // =========================================================
  // AUTH GUARD
  // =========================================================

  useEffect(() => {
    if (isBootstrapping) return;

    if (!pathname) return;

    const isPublicRoute =
      PUBLIC_ROUTES.includes(pathname) ||
      PUBLIC_ROUTES.some((route) => pathname.startsWith(`${route}/`)) ||
      pathname.startsWith("/(auth)/") ||
      pathname.startsWith("/(register)/");

    // ❌ NÃO LOGADO
    if (!token && !user) {
      if (isPublicRoute) return;

      router.replace("/login");

      return;
    }

    // ✅ LOGADO
    if (user?.isLoggedIn) {
      if (!isPublicRoute && pathname !== "/") return;

      const route =
        !user.status || !(user.status in statusRedirectMap)
          ? "/(tabs)/home"
          : statusRedirectMap[user.status as keyof typeof statusRedirectMap];

      router.replace(route as any);
    }
  }, [isBootstrapping, token, user, pathname, statusRedirectMap, ,]);

  // =========================================================
  // LOADING
  // =========================================================

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // =========================================================
  // APP
  // =========================================================

  return (
    <QueryClientProvider client={queryClient}>
      <AlertDisplay />

      <Stack
        screenOptions={{
          headerShown: false,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />

        <Stack.Screen name="login" />
        <Stack.Screen name="insert-password" />

        <Stack.Screen name="chat" />

        <Stack.Screen name="(register)" />

        <Stack.Screen name="verification" />

        <Stack.Screen name="face_recognition" />

        <Stack.Screen name="recusado_screen" />

        <Stack.Screen name="divergencia_screen" />

        <Stack.Screen name="divergencia_old_docs_screen" />

        <Stack.Screen name="reanalise_screen" />

        <Stack.Screen name="pre_aprovado_screen" />

        <Stack.Screen name="analise_screen" />

        {/* validations */}
        <Stack.Screen name="(validations)" />
      </Stack>
    </QueryClientProvider>
  );
}
