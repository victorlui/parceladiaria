export type NormalizedRect = {
  cx: number; // centro X (0-1)
  cy: number; // centro Y (0-1)
  w: number; // largura (0-1)
  h: number; // altura (0-1)
};

export function normalizeFaceBounds(
  bounds: { x: number; y: number; width: number; height: number },
  frameWidth: number,
  frameHeight: number
): NormalizedRect {
  const cx = (bounds.x + bounds.width / 2) / frameWidth;
  const cy = (bounds.y + bounds.height / 2) / frameHeight;

  return {
    cx,
    cy,
    w: bounds.width / frameWidth,
    h: bounds.height / frameHeight,
  };
}
