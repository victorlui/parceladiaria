import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  title: string;
  onClose: () => void;
}

export const Header: React.FC<Props> = ({ title, onClose }) => (
  <View>
    <View className="flex-row items-end justify-end">
      <TouchableOpacity onPress={onClose} className="p-1">
        <Ionicons name="close" size={22} color="#374151" />
      </TouchableOpacity>
    </View>
    <Text className="text-xl mb-5 text-center font-bold">{title}</Text>
  </View>
);
