import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";

const AnimatedCountdown = ({ value }: { value: number }) => {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  // anima sempre que value muda
  useEffect(() => {
    scale.value = 0.3;
    opacity.value = 0;

    scale.value = withSequence(
      withTiming(1.4, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(150, withTiming(0, { duration: 150 }))
    );
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          fontSize: 90,
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
        },
        animatedStyle,
      ]}
    >
      {value}
    </Animated.Text>
  );
};

export default AnimatedCountdown;
