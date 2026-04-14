import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

export default function LoadingScreen() {
  // 1. Criamos um valor compartilhado para a escala (começa em 1)
  const scale = useSharedValue(1);

  useEffect(() => {
    // 2. Iniciamos a animação em loop
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }), // Aumenta para 1.2x
        withTiming(1, { duration: 800 }), // Volta para 1x
      ),
      -1, // -1 indica repetição infinita
      false, // Não inverte a sequência de forma abrupta
    );
  }, []);

  // 3. Criamos o estilo animado
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: scale.value - 0.2,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Image
          source={require("@/assets/images/icon_new.png")} // Substitua pela sua logo
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 150,
    height: 150,
  },
});
