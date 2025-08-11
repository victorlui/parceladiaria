import { Stack } from "expo-router";

export default function MotoristaLayout() {
  return (
    <Stack>
      <Stack.Screen name="cnh_front_screen" options={{ headerShown: false }} />
      <Stack.Screen name="cnh_verso_screen" options={{ headerShown: false }} />
      <Stack.Screen name="placa_veiculo_screen" options={{ headerShown: false }} />
      <Stack.Screen name="document_veiculo_screen" options={{ headerShown: false }} />
      <Stack.Screen name="vehicle_photo_screen" options={{ headerShown: false }} />
      <Stack.Screen name="profile_photo_screen" options={{ headerShown: false }} />
      <Stack.Screen name="additional_print_screen" options={{ headerShown: false }} />
    </Stack>
  );
}