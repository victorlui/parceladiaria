import { normalizeFaceBounds } from "./normalizeFace";
import { isPointInsideOval } from "./isInsideOval";
import { getNormalizedOval } from "./getNormalizedOval";

export function isFaceInsideGuide(
  faceBounds: { x: number; y: number; width: number; height: number },
  frameWidth: number,
  frameHeight: number
) {
  const face = normalizeFaceBounds(faceBounds, frameWidth, frameHeight);

  const oval = getNormalizedOval();

  return isPointInsideOval(face.cx, face.cy, oval);
}
