import { useAuthStore } from "@/store/auth";
import { Text, View } from "react-native";
import DocumentAnalisy from "@/assets/images/document-analysis.svg";
import { Button } from "@/components/Button";
import { router } from "expo-router";

export default function RecusadoScreen() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <View className="flex-1  gap-5 bg-white p-5 justify-evenly">
      <View className="justify-center items-center ">
        <DocumentAnalisy height={280} />
      </View>

      <Text className="text-2xl  text-[#33404F] mb-8 text-center">
       Seu cadastro está em processo de reanálise. Em breve, nossa equipe entrará em contato.
      </Text>
      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}
