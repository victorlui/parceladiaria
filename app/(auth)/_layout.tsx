import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  const options = {
    headerShown: false,
  };
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="validity" options={options} />
        <Stack.Screen name="cpf-otp-screen" options={options} />
        <Stack.Screen name="otp-screen" options={options} />
        <Stack.Screen name="change-password-screen" options={options} />
        <Stack.Screen name="timeless_face_check" options={options} />
      </Stack>
    </>
  );
}
