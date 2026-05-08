import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RegisterLayout() {
  const options = {
    headerShown: false,
  };
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="step1" options={options} />
        <Stack.Screen name="openfinance" options={options} />
        <Stack.Screen name="termos" options={options} />
      </Stack>
    </>
  );
}
