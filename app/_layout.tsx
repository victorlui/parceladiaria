import { Stack, router, usePathname } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import "../global.css";
import { ActivityIndicator, Alert, View } from "react-native";
import { StatusCadastro } from "@/utils";
import { useAlerts } from "@/components/useAlert";
import * as Updates from "expo-updates";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/hooks/usePushNotification";
import { useForceInAppUpdate } from "@/hooks/useInAppUpdate";
import { AnalyticsBootstrap } from "@/hooks/useAnalyticsBootstrap";

// 🔔 Configuração global de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 👉 Rotas públicas (deep link permitido)
const PUBLIC_ROUTES = [
  "/login",
  "/insert-password",
  "/reset_password",
  // (auth)
  "/change-password-screen",
  "/cpf-otp-screen",
  "/otp-screen",
  // (comerciante)
  "/bussines_type_screen",
  "/cnpj",
  "/document_photo_back_screen",
  "/document_photo_front_screen",
  "/extrato",
  "/has_company_screen",
  "/storefront_video_screen",
  "/storeinterior_video_screen",
  // (motorista_new)
  "/cnh_front",
  "/cnh_verso",
  "/video_perfil",
  // (register)
  "/address_document",
  "/address_screen",
  "/chave_pix",
  "/profile_selection",
  // (register_new)
  "/pre-approved-limit",
  "/register-cpf",
  "/register-email",
  "/register-finish",
  "/register-openfinance",
  "/register-password",
  "/register-phone",
  "/timeless_face",
];

export default function RootLayout() {
  const pathname = usePathname();
  const { restoreToken, isLoading, user, token } = useAuthStore();
  const { AlertDisplay } = useAlerts();

  // ✅ HOOKS DEVEM FICAR NO TOPO (ordem fixa)
  useForceInAppUpdate();
  AnalyticsBootstrap();

  // 🔔 Push notifications (função normal)
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // 📩 Listener de notificações
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📩 Recebida:", notification);
      },
    );

    return () => sub.remove();
  }, []);

  // 🔊 Canal Android
  useEffect(() => {
    Notifications.setNotificationChannelAsync("default", {
      name: "Notificações",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }, []);

  // 🔄 OTA updates
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
            ],
          );
        }
      } catch (e) {
        console.log("Erro ao buscar update", e);
      }
    }

    checkUpdate();
  }, []);

  // 🔐 Restaurar token
  useEffect(() => {
    restoreToken().catch((e) => console.error("Erro ao restaurar token:", e));
  }, [restoreToken]);

  // 🧭 Mapa de status → rota
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

  // 🚦 Auth Guard (deep link SAFE)
  useEffect(() => {
    if (isLoading) return;

    // 👉 Se for rota pública, respeita o deep link
    if (PUBLIC_ROUTES.includes(pathname)) return;

    // 👉 Não autenticado
    if (!token && !user) {
      router.replace("/login");
      return;
    }

    // 👉 Autenticado
    if (user?.isLoggedIn) {
      const route =
        !user.status || !(user.status in statusRedirectMap)
          ? "/(tabs)"
          : statusRedirectMap[user.status as keyof typeof statusRedirectMap];
      router.replace(route as Parameters<typeof router.replace>[0]);
      return;
    }
  }, [isLoading, token, user]);

  // ⏳ Loading inicial (evita splash travada)
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AlertDisplay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />

        <Stack.Screen name="login" />
        <Stack.Screen name="insert-password" />
        <Stack.Screen name="register" />

        <Stack.Screen name="(register)" />
        <Stack.Screen name="(register_new)" />

        <Stack.Screen name="(comerciante)" />
        <Stack.Screen name="(motorista_new)" />

        <Stack.Screen name="recusado_screen" />
        <Stack.Screen name="divergencia_screen" />
        <Stack.Screen name="divergencia_old_docs_screen" />
        <Stack.Screen name="reanalise_screen" />
        <Stack.Screen name="pre_aprovado_screen" />
        <Stack.Screen name="analise_screen" />
        <Stack.Screen name="reset_password" />
      </Stack>
    </QueryClientProvider>
  );
}
