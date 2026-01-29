import { Stack } from "expo-router";
import React from "react";

const RegisterNewLayout: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register-cpf" />
      <Stack.Screen name="register-password" />
      <Stack.Screen name="pre-approved-limit" />
      <Stack.Screen name="register-phone" />
      <Stack.Screen name="register-email" />
      <Stack.Screen name="register-openfinance" />
      <Stack.Screen name="register-finish" />
    </Stack>
  );
};

export default RegisterNewLayout;
