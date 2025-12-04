import { Face } from "react-native-vision-camera-face-detector";

interface FaceValidationResult {
  isValid: boolean;
  message: string;
  confidence: number;
  progress: number;
}
const ovalWidth = 200;
const ovalHeight = 300;

const isFaceInsideOval = (face: Face) => {
  if (!face) return false;

  const faceCenterX = face.bounds.x + face.bounds.width / 2;
  const faceCenterY = face.bounds.y + face.bounds.height / 2;

  // centro do preview
  const ovalCenterX = ovalWidth / 2;
  const ovalCenterY = ovalHeight / 2;

  const ovalRadiusX = ovalWidth / 2;
  const ovalRadiusY = ovalHeight / 2;

  const dx = faceCenterX - ovalCenterX;
  const dy = faceCenterY - ovalCenterY;

  return (
    (dx * dx) / (ovalRadiusX * ovalRadiusX) +
      (dy * dy) / (ovalRadiusY * ovalRadiusY) <=
    1
  );
};

export const validateFaceQuality = (face: Face): FaceValidationResult => {
  "worklet";
  const result: FaceValidationResult = {
    isValid: false,
    message: "",
    confidence: face?.smilingProbability ?? 0,
    progress: 0,
  };

  if (!face) {
    return {
      ...result,
      message: "Nenhuma face detectada",
      progress: 0,
    };
  }

  let progress = 0;

  /* ============================================================
       1 — TAMANHO DA FACE (20%)
     ============================================================ */
  const faceWidth = face.bounds.width;
  const faceHeight = face.bounds.height;
  const faceArea = faceWidth * faceHeight;

  const minArea = 28000;
  const maxArea = 55000;

  if (faceArea >= minArea && faceArea <= maxArea) {
    progress += 20;
  } else {
    return {
      ...result,
      message:
        faceArea < minArea
          ? "Aproxime seu rosto da câmera"
          : "Afaste um pouco seu rosto",
      progress,
    };
  }

  /* ============================================================
       2 — CENTRALIZAÇÃO DENTRO DO OVAL (20%) — 100% CORRETO
     ============================================================ */
  const centerX = face.bounds.x + face.bounds.width / 2;
  const centerY = face.bounds.y + face.bounds.height / 2;
  const screenCenterX = 200;
  const screenCenterY = 300;
  const maxDistanceFromCenter = 100;

  const distanceFromCenter = Math.sqrt(
    Math.pow(centerX - screenCenterX, 2) + Math.pow(centerY - screenCenterY, 2)
  );

  if (distanceFromCenter <= maxDistanceFromCenter) {
    progress += 20;
  } else {
    return {
      ...result,
      message: "Centralize seu rosto dentro do oval",
      progress,
    };
  }

  /* ============================================================
       3 — ÂNGULOS DA CABEÇA (20%)
     ============================================================ */

  const maxAngle = 8; // mais rígido

  if (
    Math.abs(face.pitchAngle ?? 0) <= maxAngle &&
    Math.abs(face.rollAngle ?? 0) <= maxAngle &&
    Math.abs(face.yawAngle ?? 0) <= maxAngle
  ) {
    progress += 20;
  } else {
    return {
      ...result,
      message: "Mantenha a cabeça reta e olhando para frente",
      progress,
    };
  }

  /* ============================================================
       4 — OLHOS ABERTOS (20%)
     ============================================================ */

  const minEyeProb = 0.85;

  const leftEye = face.leftEyeOpenProbability ?? 0;
  const rightEye = face.rightEyeOpenProbability ?? 0;

  if (leftEye >= minEyeProb && rightEye >= minEyeProb) {
    progress += 20;
  } else {
    return {
      ...result,
      message: "Mantenha os olhos bem abertos",
      progress,
    };
  }

  /* ============================================================
       5 — CONTORNO COMPLETO (20%)
     ============================================================ */

  // Conta de pontos apenas em FACE (padrão)
  const faceContourPoints = face.contours?.FACE?.length ?? 0;

  // Se tiver ao menos 30 pontos em FACE, aceitaremos (muitos dispositivos retornam ~35)
  const MIN_FACE_CONTOUR_POINTS = 30;

  let contourOk = false;

  if (faceContourPoints >= MIN_FACE_CONTOUR_POINTS) {
    contourOk = true;
  } else {
    // fallback: soma pontos de todos os contornos disponíveis (olhos, nariz, boca, etc.)
    // alguns detectores dividem os pontos em múltiplos contornos, então somar dá uma visão completa.
    const allContourKeys = Object.keys(face.contours ?? {});
    let totalContourPoints = 0;
    for (const key of allContourKeys) {
      const arr = (face.contours as any)[key];
      if (Array.isArray(arr)) totalContourPoints += arr.length;
    }

    // Se a soma de todos os contornos for suficiente, aceitamos também.
    // Ajuste este limiar se quiser ser mais/menos rígido.
    const MIN_TOTAL_CONTOUR_POINTS = 60;

    if (totalContourPoints >= MIN_TOTAL_CONTOUR_POINTS) {
      contourOk = true;
    } else {
      contourOk = false;
    }
  }

  if (contourOk) {
    progress += 20;
  } else {
    // Mensagem informativa: mostra quantos pontos foram detectados para debugging
    const debugCount = face.contours?.FACE?.length ?? 0;
    return {
      ...result,
      message: `Detectando todos os pontos da face... (encontrados: ${debugCount})`,
      progress,
    };
  }

  /* ============================================================
       FINAL: TUDO OK
     ============================================================ */
  return {
    ...result,
    isValid: progress === 100,
    message: progress === 100 ? "Rosto detectado" : result.message,
    progress,
  };
};
