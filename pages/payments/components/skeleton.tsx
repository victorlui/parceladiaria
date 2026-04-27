import { Colors } from "@/constants/Colors";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

const Skeleton: React.FC = () => {
  const skeletonOpacity = React.useRef(new Animated.Value(0.6)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [skeletonOpacity]);
  return (
    <Animated.View style={{ opacity: skeletonOpacity }}>
      <View style={styles.unpaidContainer}>
        <View
          style={[
            styles.checkbox,
            { borderColor: "#E5E7EB", backgroundColor: "#E5E7EB" },
          ]}
        />

        <View style={{ flex: 1, gap: 6 }}>
          <View
            style={{
              height: 16,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              width: "50%",
            }}
          />
          <View
            style={{
              height: 14,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              width: "35%",
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  unpaidContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
  },
  installment: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
  },
});

export default Skeleton;
