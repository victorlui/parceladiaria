import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  const options = {
    headerShown: false,

  }
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen 
          name="cpf-otp-screen" 
          options={options} 
        />
      </Stack>
     </>
   );
}