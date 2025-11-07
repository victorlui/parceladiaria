import { ReactNode } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  icon: ReactNode;
  color: string;
  size: number;
  gradientColors?: any;
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
};

export default function CircleIcon({
  icon,
  color,
  size,
  gradientColors,
  gradientStart,
  gradientEnd,
}: Props) {
  return (
    <View className="w-full items-center">
      {/* Se houver gradiente, usa LinearGradient; caso contrário, mantém fundo sólido */}
      {gradientColors && gradientColors.length > 1 ? (
        <LinearGradient
          colors={gradientColors}
          start={gradientStart ?? { x: 0, y: 0 }}
          end={gradientEnd ?? { x: 1, y: 1 }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </LinearGradient>
      ) : (
        <View
          className="flex items-center justify-center rounded-full"
          style={{ backgroundColor: color, width: size, height: size }}
        >
          {icon}
        </View>
      )}
    </View>
  );
}
