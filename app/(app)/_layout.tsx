import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="qrdcode" options={{ headerShown: false }} />
    </Stack>
  );
}
