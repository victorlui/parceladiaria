import React from "react";
import { Animated, View } from "react-native";

// Dentro do arquivo: adicionar o componente SkeletonItem
export const SkeletonItem: React.FC = () => {
  // ... existing code ...
  const opacity = React.useRef(new Animated.Value(0.6)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className="items-center w-[25%]">
      <View className="bg-gray-200 rounded-full w-16 h-16" />
      <View className="bg-gray-200 rounded-md w-20 h-3 mt-3" />
    </Animated.View>
  );
};
