import { AnalyticsProvider } from "@/analytics/analitics.provider";
import { useAlerts } from "@/components/useAlert";
import { useForceInAppUpdate } from "@/hooks/useInAppUpdate";
import { useLiveUpdate } from "@/hooks/useLiveUpdate";
import { usePushNotification } from "@/hooks/usePushNotification";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import React from "react";

export default function RootLayout() {
  const { AlertDisplay } = useAlerts();

  const { isLoading: authLoading } = useAuthStore();
  const { hydrated: registerHydrated } = useRegisterStore();
  const isLoading = authLoading || !registerHydrated;

  useLiveUpdate();
  useForceInAppUpdate();
  usePushNotification({ disabled: isLoading });

  return (
    <PostHogProvider
      apiKey="phc_AJf6vqLnxsMK2MC43QEAWVj92jc8EcFC5vmzMQoBmE7d"
      options={{
        host: "https://us.i.posthog.com",
        disabled: false,
        enablePersistSessionIdAcrossRestart: true,
        enableSessionReplay: true,
        sessionReplayConfig: {
          maskAllImages: false,
          maskAllTextInputs: false,
          maskAllSandboxedViews: false,
          throttleDelayMs: 3000,
          captureNetworkTelemetry: false,
          captureLog: false,
        },
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: ["error", "warn"],
          },
        },
      }}
    >
      <AnalyticsProvider>
        <QueryClientProvider client={queryClient}>
          <AlertDisplay />
          <Stack
            screenOptions={{
              headerShown: false,
              fullScreenGestureEnabled: true,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="index" />
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
      </AnalyticsProvider>
    </PostHogProvider>
  );
}
