import { Stack } from "expo-router";

export default function LayoutComerciante() {
  const options = {
    headerShown: false,
  };
  return (
    <Stack>
      <Stack.Screen name="document_photo_front_screen" options={options} />
      <Stack.Screen name="document_photo_back_screen" options={options} />
      <Stack.Screen name="bussines_type_screen" options={options} />
      <Stack.Screen name="bussines_description_screen" options={options} />
      <Stack.Screen name="has_company_screen" options={options} />
      <Stack.Screen name="contract_social_screen" options={options} />
      <Stack.Screen name="storefront_photo_screen" options={options} />
      <Stack.Screen name="storeinterior_photo_screen" options={options} />
      <Stack.Screen name="storevideo_photo_screen" options={options} />
    </Stack>
  );
}
