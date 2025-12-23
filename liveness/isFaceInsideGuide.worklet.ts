export function isFaceInsideGuideWorklet(face: any, oval: any, frame: any) {
  "worklet";

  // Centro do rosto
  const nx = (face.bounds.x + face.bounds.width / 2) / frame.width;
  const ny = (face.bounds.y + face.bounds.height / 2) / frame.height;

  // Tamanho do rosto (usamos a maior dimensão para escala)
  const faceSize = Math.max(
    face.bounds.width / frame.width,
    face.bounds.height / frame.height
  );

  const dx = nx - oval.cx;
  const dy = ny - oval.cy;

  // Score da elipse
  const score =
    (dx * dx) / (oval.rx * oval.rx) + (dy * dy) / (oval.ry * oval.ry);

  // Validação de distância (Sweet spot: o rosto deve ocupar ~35% a ~55% da largura)
  let distance = "ok";
  if (faceSize < 0.35) distance = "too-far";
  if (faceSize > 0.6) distance = "too-close";

  return {
    isInside: score <= 1.05 && distance === "ok",
    x: nx,
    y: ny,
    score: score,
    distance: distance,
  };
}
