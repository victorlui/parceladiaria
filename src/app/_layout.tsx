import { queryClient } from "@/lib/queryClient";
import GlobalAlert from "@/shared/components/GlobalAlert";
import { Colors } from "@/shared/constants/colors";
import { usePushNotification } from "@/shared/hooks/usePushNotification";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Edges, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const platform = Platform.OS;
  const edges: Edges | undefined =
    platform === "ios" ? ["top"] : ["bottom", "top"];

  usePushNotification();

  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <SafeAreaView
          edges={edges}
          style={{ flex: 1, backgroundColor: Colors.green.primary }}
        >
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/password" />
            <Stack.Screen
              name="(register)/register"
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="chat" />
          </Stack>
          <GlobalAlert />
        </SafeAreaView>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}
