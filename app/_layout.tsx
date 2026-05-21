import { useAlerts } from "@/components/useAlert";
import { useForceInAppUpdate } from "@/hooks/useInAppUpdate";
import { useLiveUpdate } from "@/hooks/useLiveUpdate";
import { usePushNotification } from "@/hooks/usePushNotification";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { StatusCadastro } from "@/utils";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Stack, router, usePathname } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Platform,
  Text,
  View,
} from "react-native";

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
  "/timeless_face_check",
  "/validity",

  "/verification",
  "/pre_aprovado_screen",
  "/reanalise_screen",
  "/analise_screen",
  "/divergencia_screen",
  "/recusado_screen",
];

export default function RootLayout() {
  const pathname = usePathname() ?? "";

  const { restoreToken, isLoading, user, token, hasHydrated } = useAuthStore();

  const { AlertDisplay } = useAlerts();

  const [didRestoreToken, setDidRestoreToken] = useState(false);
  const [didCheckColdStartNotification, setDidCheckColdStartNotification] =
    useState(false);

  // Controle de UX para exibir o loading durante redirecionamentos por notificação
  const [isNavigatingNotification, setIsNavigatingNotification] =
    useState(false);

  const isPublicPathname = useCallback((path: string) => {
    if (!path) return true;

    return (
      PUBLIC_ROUTES.includes(path) ||
      PUBLIC_ROUTES.some((route) => path.startsWith(`${route}/`)) ||
      path.startsWith("/(auth)/") ||
      path.startsWith("/(register)/")
    );
  }, []);

  // =========================================================
  // REFS
  // =========================================================

  const pendingNotificationRouteRef = useRef<string | null>(null);

  const lastHandledNotificationKeyRef = useRef<string | null>(null);

  // Ref para monitorar se a inicialização atual veio de um app totalmente encerrado
  const isColdStartRef = useRef<boolean>(false);
  const authRedirectTargetRef = useRef<string | null>(null);

  // =========================================================
  // HOOKS
  // =========================================================

  useLiveUpdate();

  useForceInAppUpdate();

  usePushNotification({ disabled: isLoading });

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

    const parsed = Linking.parse(url);

    const rawPath =
      typeof parsed.path === "string" && parsed.path.length > 0
        ? parsed.path
        : typeof parsed.hostname === "string" && parsed.hostname.length > 0
          ? parsed.hostname
          : "";

    const cleanedRawPath = rawPath.split("#")[0] ?? "";

    const withLeadingSlash = cleanedRawPath.startsWith("/")
      ? cleanedRawPath
      : `/${cleanedRawPath}`;

    const segments = withLeadingSlash.split("/").filter(Boolean);

    if (segments[0] === "--") {
      segments.shift();
    }

    if (segments.length === 0) return null;

    segments[0] = segments[0].toLowerCase().replace(/-/g, "_");

    const adjustedPath = `/${segments.join("/")}`;

    const queryParams = parsed.queryParams ?? {};
    const queryString = new URLSearchParams(
      Object.entries(queryParams).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (typeof value === "string") acc[key] = value;
          if (typeof value === "number" || typeof value === "boolean") {
            acc[key] = String(value);
          }
          return acc;
        },
        {},
      ),
    ).toString();

    const normalized =
      queryString.length > 0 ? `${adjustedPath}?${queryString}` : adjustedPath;

    const firstSegment = segments[0];

    if (firstSegment && TAB_ROUTES.includes(firstSegment)) {
      return `/(tabs)${normalized}`;
    }

    return normalized;
  }, []);

  // =========================================================
  // HANDLE NOTIFICATION ROUTE (BLINDADO CONTRA CRASH)
  // =========================================================

  const handleNotificationRoute = useCallback(
    (route: string) => {
      if (!route || typeof route !== "string" || route.trim() === "") {
        console.warn(
          "[Notification] Rota inválida rejeitada para evitar crash:",
          route,
        );
        return;
      }

      try {
        const { token: currentToken, user: currentUser } =
          useAuthStore.getState();

        const isLogged = !!currentToken && !!currentUser?.isLoggedIn;

        console.log("NOTIFICATION_REDIRECT", { route, isLogged });

        // =====================================================
        // NÃO LOGADO
        // =====================================================

        if (!isLogged) {
          pendingNotificationRouteRef.current = route;

          if (isLoading || !didRestoreToken) {
            return;
          }

          if (!isPublicPathname(pathname) && pathname !== "/login") {
            setIsNavigatingNotification(true);
            router.replace("/login");
          }

          return;
        }

        // =====================================================
        // LOGADO
        // =====================================================

        setIsNavigatingNotification(true);

        InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            try {
              if (pathname !== route) {
                router.push(route as any);
              }
            } catch (err) {
              console.error(
                "[Notification] Erro crítico ao executar router.push (Rota inexistente?):",
                err,
              );
            } finally {
              setIsNavigatingNotification(false);
            }
          });
        });
      } catch (globalError) {
        console.error(
          "[Notification] Erro geral no handleNotificationRoute:",
          globalError,
        );
        setIsNavigatingNotification(false);
      }
    },
    [pathname, isLoading, didRestoreToken, isPublicPathname],
  );

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
  // IOS/ANDROID CLICK LISTENER (APP EM SEGUNDO PLANO / ABERTO)
  // =========================================================

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        try {
          const key =
            `${response.notification.request.identifier}:` +
            `${response.actionIdentifier}`;

          // evita duplicação
          if (key === lastHandledNotificationKeyRef.current) {
            return;
          }

          lastHandledNotificationKeyRef.current = key;

          const url = response.notification.request.content.data?.url;

          const route = normalizeNotificationRoute(url);

          console.log("NOTIFICATION_REDIRECT", { source: "click", route });

          if (!route) return;

          handleNotificationRoute(route);
        } catch (err) {
          console.error("notification listener error", err);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [normalizeNotificationRoute, handleNotificationRoute]);

  // =========================================================
  // NOTIFICATION LISTENER (COLD START - APP TOTALMENTE FECHADO)
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const bootstrapNotification = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();

        if (!response || !isMounted) return;

        const key =
          `${response.notification.request.identifier}:` +
          `${response.actionIdentifier}`;

        if (key === lastHandledNotificationKeyRef.current) {
          return;
        }

        lastHandledNotificationKeyRef.current = key;

        const url = response.notification.request.content.data?.url;

        const route = normalizeNotificationRoute(url);

        console.log("NOTIFICATION_REDIRECT", { source: "cold_start", route });

        if (!route) return;

        // Marcamos que houve um cold start por push e bloqueamos a tela temporariamente
        isColdStartRef.current = true;
        setIsNavigatingNotification(true);
        pendingNotificationRouteRef.current = route;
      } catch (err) {
        console.error("bootstrapNotification error", err);
      } finally {
        if (isMounted) {
          setDidCheckColdStartNotification(true);
        }
      }
    };

    bootstrapNotification();

    return () => {
      isMounted = false;
    };
  }, [normalizeNotificationRoute]);

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
  // RESTORE TOKEN (COM TRATAMENTO DE CONCORRÊNCIA PARA COLD START)
  // =========================================================

  useEffect(() => {
    if (!didCheckColdStartNotification) return;

    let isActive = true;

    const execRestore = async () => {
      try {
        await restoreToken({
          retries: isColdStartRef.current ? 1 : 0,
          retryDelayMs: 350,
        });
      } catch (e) {
        console.error("Erro restoreToken:", e);
      } finally {
        if (isActive) {
          setDidRestoreToken(true);
        }
      }
    };

    execRestore();

    return () => {
      isActive = false;
    };
  }, [restoreToken, didCheckColdStartNotification]);

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

  const isBootstrapping = isLoading || !didRestoreToken || !hasHydrated;

  useEffect(() => {
    console.log("ROUTE_CHANGED", { pathname });
  }, [pathname]);

  useEffect(() => {
    console.log("AUTH_CHANGED", {
      hasToken: !!token,
      hasUser: !!user,
      isLoggedIn: !!user?.isLoggedIn,
    });
  }, [token, user]);

  useEffect(() => {
    if (!hasHydrated || !didRestoreToken) return;
    console.log("HYDRATED", { hasHydrated, didRestoreToken });
  }, [hasHydrated, didRestoreToken]);

  // =========================================================
  // AUTH GUARD + REDIRECIONAMENTO DE NOTIFICAÇÃO (SEGURO)
  // =========================================================

  useEffect(() => {
    if (isBootstrapping) return;

    if (!pathname) return;

    try {
      const isPublicRoute = isPublicPathname(pathname);

      if (authRedirectTargetRef.current === pathname) {
        authRedirectTargetRef.current = null;
      }

      // =====================================================
      // NÃO LOGADO
      // =====================================================

      if (!token && !user) {
        setIsNavigatingNotification(false);
        if (isPublicRoute) return;

        if (
          pathname !== "/login" &&
          authRedirectTargetRef.current !== "/login"
        ) {
          console.log("REDIRECT_TO_AUTH", { from: pathname, to: "/login" });
          authRedirectTargetRef.current = "/login";
          router.replace("/login");
        }

        return;
      }

      // =====================================================
      // LOGADO
      // =====================================================

      if (user) {
        // Se houver uma rota pendente salva, consome ela de forma isolada
        if (pendingNotificationRouteRef.current) {
          const routeToNavigate = pendingNotificationRouteRef.current;
          pendingNotificationRouteRef.current = null;
          isColdStartRef.current = false;

          if (
            routeToNavigate &&
            typeof routeToNavigate === "string" &&
            pathname !== routeToNavigate
          ) {
            setIsNavigatingNotification(true);
            InteractionManager.runAfterInteractions(() => {
              requestAnimationFrame(() => {
                try {
                  console.log("NOTIFICATION_REDIRECT", {
                    source: "pending",
                    from: pathname,
                    to: routeToNavigate,
                  });
                  router.push(routeToNavigate as any);
                } catch (err) {
                  console.error(
                    "[Notification ColdStart] Falha ao empurrar rota pendente:",
                    err,
                  );
                } finally {
                  setIsNavigatingNotification(false);
                }
              });
            });
          } else {
            setIsNavigatingNotification(false);
          }
          return;
        }

        if (
          authRedirectTargetRef.current &&
          pathname !== authRedirectTargetRef.current
        ) {
          return;
        }

        // Já está em rota privada protegida, não faz nada
        if (!isPublicRoute && pathname !== "/") {
          return;
        }

        const route =
          !user.status || !(user.status in statusRedirectMap)
            ? "/(tabs)/home"
            : statusRedirectMap[user.status as keyof typeof statusRedirectMap];

        if (pathname !== route && authRedirectTargetRef.current !== route) {
          console.log("REDIRECT_TO_APP", { from: pathname, to: route });
          authRedirectTargetRef.current = route;
          router.replace(route as any);
        }
      }
    } catch (authGuardError) {
      console.error(
        "[AuthGuard] Erro interceptado no fluxo de autenticação:",
        authGuardError,
      );
      setIsNavigatingNotification(false);
    }
  }, [
    isBootstrapping,
    token,
    user,
    pathname,
    statusRedirectMap,
    isPublicPathname,
  ]);

  // =========================================================
  // LOADING DE INICIALIZAÇÃO
  // =========================================================

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
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

      {/* 
        Feedback Visual de UX: Bloqueia interações repetidas na árvore de views
        enquanto a rota recuperada do push/deeplink está carregando.
      */}
      {isNavigatingNotification && (
        <View className="absolute inset-0 bg-black/30 items-center justify-center z-[9999]">
          <View className="bg-white p-6 rounded-2xl items-center shadow-lg">
            <ActivityIndicator size="large" color="#000" />
            <Text className="mt-3 text-sm font-medium text-gray-600">
              Carregando notificação...
            </Text>
          </View>
        </View>
      )}
    </QueryClientProvider>
  );
}
