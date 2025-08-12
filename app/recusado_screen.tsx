import { useAuthStore } from "@/store/auth";
import { Text, View } from "react-native";
import NotAccess from "@/assets/images/access-denied.svg";
import { Button } from "@/components/Button";
import { router } from "expo-router";

export default function RecusadoScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <View className="flex-1  gap-5 bg-white p-5 justify-evenly">
      <View className="justify-center items-center ">
        <NotAccess height={350} />
      </View>

      <Text className="text-base  text-[#33404F] mb-8 text-center">
       {user?.motivo_recusa}
      </Text>
      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}
