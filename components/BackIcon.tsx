import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { View } from "react-native";

export default function BackIcon() {
  return (
    <View className="flex-row items-center mt-4">
      <Ionicons
        name="chevron-back-sharp"
        size={28}
        color="#1a1a1a"
        onPress={() => router.back()}
      />
    </View>
  );
}
