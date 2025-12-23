import React from "react";
import { Dimensions } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export function FaceDebugPoint({ faceX, faceY }: any) {
  const cx = useDerivedValue(() => {
    return faceX.value * width;
  });

  const cy = useDerivedValue(() => {
    return faceY.value * height;
  });

  return (
    <Canvas style={{ position: "absolute", width, height }}>
      <Circle cx={cx} cy={cy} r={8} color="red" />
    </Canvas>
  );
}
