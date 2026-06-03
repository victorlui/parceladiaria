import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RecoveryLayout() {
  const options = {
    headerShown: false,
  };
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="cpf" options={options} />
        <Stack.Screen name="birthdate" options={options} />
        <Stack.Screen name="questions" options={options} />
        <Stack.Screen name="change-password" options={options} />
        <Stack.Screen name="face" options={options} />
        <Stack.Screen name="otp" options={options} />
      </Stack>
    </>
  );
}
