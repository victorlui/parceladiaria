import React from "react";
import { Dimensions } from "react-native";
import { Canvas, Path, Skia, FillType } from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

type Props = {
  strokeColor?: string;
  strokeWidth?: number;
  overlayColor?: string;
};

export function FaceGuideOval({
  strokeColor = "#00FF88",
  strokeWidth = 4,
  overlayColor = "rgba(0,0,0,0.6)",
}: Props) {
  const guideWidth = width * 0.7;
  const guideHeight = guideWidth * 1.25; // formato rosto

  const x = (width - guideWidth) / 2;
  const y = (height - guideHeight) / 2;

  console.log("formato rosto", guideWidth, guideHeight);

  // Path do overlay com furo
  const overlayPath = Skia.Path.Make();
  overlayPath.addRect(Skia.XYWHRect(0, 0, width, height));
  overlayPath.addOval(Skia.XYWHRect(x, y, guideWidth, guideHeight));
  overlayPath.setFillType(FillType.EvenOdd);

  // Path da borda do oval
  const borderPath = Skia.Path.Make();
  borderPath.addOval(Skia.XYWHRect(x, y, guideWidth, guideHeight));

  return (
    <Canvas style={{ position: "absolute", width, height }}>
      {/* Overlay com furo */}
      <Path path={overlayPath} color={overlayColor} />

      {/* Borda do rosto */}
      <Path
        path={borderPath}
        color={strokeColor}
        style="stroke"
        strokeWidth={strokeWidth}
      />
    </Canvas>
  );
}
