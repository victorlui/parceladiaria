import { Colors } from "@/constants/Colors";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { FontAwesome } from "@expo/vector-icons";

interface Props {
  animate?: boolean;
  size?: number;
  strokeWidth?: number;
}

const RingLoader: React.FC<Props> = ({ animate = false, size = 84, strokeWidth = 6 }) => {
  const rotate = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animate) {
      rotate.setValue(0);
      const loop = Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
  }, [animate, rotate]);

  const rotationStyle = animate
    ? {
        transform: [
          {
            rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }),
          },
        ],
      }
    : undefined;

  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * 0.28;

  return (
    <View style={[styles.container, { width: size + 16, height: size + 16 }]}>
      <View style={styles.shadow}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={"#E6F5F3"} strokeWidth={strokeWidth} fill="none" />
        </Svg>
      </View>
      <Animated.View style={rotationStyle}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={Colors.green.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={c * 0.1}
          />
        </Svg>
      </Animated.View>
      <View style={styles.icon}>
        <FontAwesome name="check" size={26} color={Colors.green.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    position: "absolute",
  },
  icon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RingLoader;