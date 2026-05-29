import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RegisterLayout() {
  const options = {
    headerShown: false,
    gestureEnabled: false,
  };
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ gestureEnabled: false }}>
        <Stack.Screen name="step1" options={options} />
        <Stack.Screen name="openfinance" options={options} />
        <Stack.Screen name="palenca" options={options} />
        <Stack.Screen name="termos" options={options} />
      </Stack>
    </>
  );
}
