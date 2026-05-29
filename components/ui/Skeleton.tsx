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
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ opacity }, { alignItems: "center", width: "25%" }]}
    >
      <View
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: 9999,
          width: 64,
          height: 64,
        }}
      />
      <View
        style={{
          backgroundColor: "#e5e7eb",
          borderRadius: 6,
          width: 80,
          height: 12,
          marginTop: 12,
        }}
      />
    </Animated.View>
  );
};
