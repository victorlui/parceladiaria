import { useMemo } from "react";
import { Dimensions } from "react-native";

export function useNormalizedOval() {
  return useMemo(() => {
    const { width, height } = Dimensions.get("window");

    // 1. Definimos o tamanho visual (Pixels)
    const ovalWidthInPixels = width * 0.7;
    const ovalHeightInPixels = ovalWidthInPixels * 1.25;

    // 2. Normalizamos (0 a 1)
    // O raio (rx/ry) é a METADE do diâmetro total
    const rx = ovalWidthInPixels / 2 / width;
    const ry = ovalHeightInPixels / 2 / height;

    return {
      cx: 0.5, // Centro da tela (50%)
      cy: 0.5, // Centro da tela (50%)
      rx: rx, // Agora será algo em torno de 0.35
      ry: ry, // Agora será algo em torno de 0.28
    };
  }, []);
}
