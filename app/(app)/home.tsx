import { useAuthStore } from "@/store/auth";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const HomeScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-white">Home</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
