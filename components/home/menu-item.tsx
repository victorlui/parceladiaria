import { Text, TouchableOpacity, View, Animated } from "react-native";

import CircleIcon from "../ui/CircleIcon";

type Item = {
  key: string;
  title: string;
  icon: React.ReactNode;
  available: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

export const MenuItem: React.FC<Item> = ({
  title,
  icon,
  available,
  onPress,
  disabled,
}) => {
  return (
    <Animated.View className="items-center w-[25%] my-5">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="items-center"
        disabled={disabled}
      >
        <View className="relative">
          {!disabled && available && title === "Renovar Empréstimo" && (
            <View className="absolute -top-2 -left-2 bg-red-600 rounded-full px-2 py-1 z-10">
              <Text className="text-white text-[10px]">Disponível</Text>
            </View>
          )}
          <CircleIcon
            icon={icon}
            color={disabled ? "#4B5563" : "#fff"}
            size={64}
            gradientColors={
              disabled ? ["#6b717a", "#8a919b"] : ["#2CCA6C", "#16A34A"]
            } // gradiente verde como na imagem
            gradientStart={{ x: 0.1, y: 0.1 }}
            gradientEnd={{ x: 0.9, y: 0.9 }}
          />
        </View>
        <Text className="text-gray-700 text-xs font-semibold mt-2 text-center w-24">
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
