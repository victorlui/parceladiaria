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
        <Stack.Screen name="profile_selection" options={options} />
        <Stack.Screen name="address_screen" options={options} />
        <Stack.Screen name="chave_pix" options={options} />
        <Stack.Screen name="address_document" options={options} />
        <Stack.Screen name="recognition_face" options={options} />
      </Stack>
    </>
  );
}
