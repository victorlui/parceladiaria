import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export function getNormalizedOval() {
  const ovalWidth = width * 0.7;
  const ovalHeight = ovalWidth * 1.25;

  return {
    cx: 0.5,
    cy: 0.5,
    rx: ovalWidth / 2 / width,
    ry: ovalHeight / 2 / height,
  };
}
