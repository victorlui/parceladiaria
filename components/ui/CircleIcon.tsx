import { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  icon: ReactNode;
  color: string;
  size: number;
};

export default function CircleIcon({ icon, color, size }: Props) {
  return (
    <View className="w-full items-center">
      <View
        className="flex items-center justify-center rounded-full"
        style={{ backgroundColor: color, width: size, height: size }}
      >
        {icon}
      </View>
    </View>
  );
}
