import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/auth";
import { QueryClientProvider } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

export default function RootLayout() {
  // const colorScheme = useColorScheme();
  // const router = useRouter();
  const { restoreToken,token } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      await restoreToken();
      setLoading(false);
    };
    restore();
  }, [restoreToken]);

  // useEffect(() => {
  //   if (!loading && token) {
  //     router.replace("/(register)/birthday_screen");
  //   }
  // }, [loading,token]);


  if (loading) {
    return (
      <View className="flex-1  items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator color={"red"} size={50} />
      </View>
    );
  }

  

  return (
    <QueryClientProvider client={queryClient}>
     
        <Stack>
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="+not-found" /> */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="insert-password" options={{ headerShown: false }} />
          <Stack.Screen name="(register)" options={{ headerShown: false }} />
           <Stack.Screen name="(comerciante)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
    </QueryClientProvider>
  );
}
