import { Stack } from "expo-router";

export default function MotoristaLayout() {
  return (
    <Stack>
      <Stack.Screen name="cnh_front" options={{ headerShown: false }} />
      <Stack.Screen name="cnh_verso" options={{ headerShown: false }} />
      <Stack.Screen name="video_perfil" options={{ headerShown: false }} />
      <Stack.Screen
        name="timeless_face_motorista"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
