import { Colors } from "@/constants/Colors";
import { ActivityIndicator, Text, View } from "react-native";

interface Props {
  text?: string;
}

export default function Spinner({ text = "Carregando..." }: Props) {
  return (
    <View className="z-10 absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-black/50">
      <ActivityIndicator color={Colors.white} size={40} />
      <Text className="text-white text-lg mt-4">{text}</Text>
    </View>
  );
}
