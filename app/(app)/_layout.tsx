import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="qrdcode" options={{ headerShown: false }} />
      <Stack.Screen name="indications" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-pix" options={{ headerShown: false }} />
    </Stack>
  );
}
