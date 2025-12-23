type Oval = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export function isPointInsideOval(x: number, y: number, oval: Oval) {
  const dx = x - oval.cx;
  const dy = y - oval.cy;

  return (dx * dx) / (oval.rx * oval.rx) + (dy * dy) / (oval.ry * oval.ry) <= 1;
}
