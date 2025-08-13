import { Stack } from "expo-router";
import React from "react";


export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="video_screen" options={{ headerShown: false }} />
      <Stack.Screen name="my_loans_screen" options={{ headerShown: false }} />
      <Stack.Screen name="profile_screen" options={{ headerShown: false }} />
      <Stack.Screen name="settings_screen" options={{ headerShown: false }} />
      <Stack.Screen name="qr_code_screen" options={{ headerShown: false }} />
      <Stack.Screen name="view_terms" options={{ headerShown: false, }} />
    </Stack>
  );
}
