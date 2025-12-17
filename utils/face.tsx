import { Face } from "react-native-vision-camera-face-detector";
import { Platform, Dimensions } from "react-native";

const IS_IOS = Platform.OS === "ios";

// Definição da Interface (Mantenha o código original se preferir)
interface FaceValidationResult {
  isValid: boolean;
  message: string;
  confidence: number;
  progress: number;
}

interface FrameSize {
  width: number;
  height: number;
}

// NOVO CÓDIGO: Aceitando frameSize como segundo argumento
export const validateFaceQuality = (
  face: Face,
  frameSize: FrameSize
): FaceValidationResult => {
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

  let progress = 0; /* ============================================================
       1 — TAMANHO DA FACE (20%) - MANTENDO OS AJUSTES
     ============================================================ */

  const faceWidth = face.bounds.width;
  const faceHeight = face.bounds.height;
  const faceArea = faceWidth * faceHeight;

  let minArea = 28000;
  let maxArea = 55000;

  if (IS_IOS) {
    // Limites Ajustados para iOS (Mantidos da última tentativa)
    minArea = 20000;
    maxArea = 90000;
  }

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
  } /* ============================================================
       2 — CENTRALIZAÇÃO DENTRO DO OVAL (20%) — DINÂMICO AGORA
     ============================================================ */

  const centerX = face.bounds.x + face.bounds.width / 2;
  const centerY = face.bounds.y + face.bounds.height / 2; // CÁLCULO DINÂMICO DO CENTRO COM BASE NO frameSize PASSADO
  const screenCenterX = frameSize.width / 2;
  const screenCenterY = frameSize.height / 2; // Ajuste a tolerância (pode ser necessário aumentar este valor para iOS)
  const maxDistanceFromCenter = IS_IOS ? 120 : 100;

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
  } /* ============================================================
       3 — ÂNGULOS DA CABEÇA (20%)
     ============================================================ */ // Mantido o maxAngle 8 (você pode aumentar se for muito rígido)

  const maxAngle = 8;

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
  } /* ============================================================
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
  } /* ============================================================
       5 — CONTORNO COMPLETO (20%)
     ============================================================ */ // ... (mantido inalterado)

  const faceContourPoints = face.contours?.FACE?.length ?? 0;
  const MIN_FACE_CONTOUR_POINTS = 30;

  let contourOk = false;

  if (faceContourPoints >= MIN_FACE_CONTOUR_POINTS) {
    contourOk = true;
  } else {
    const allContourKeys = Object.keys(face.contours ?? {});
    let totalContourPoints = 0;
    for (const key of allContourKeys) {
      const arr = (face.contours as any)[key];
      if (Array.isArray(arr)) totalContourPoints += arr.length;
    }

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
    const debugCount = face.contours?.FACE?.length ?? 0;
    return {
      ...result,
      message: `Detectando todos os pontos da face... (encontrados: ${debugCount})`,
      progress,
    };
  } /* ============================================================
       FINAL: TUDO OK
     ============================================================ */

  return {
    ...result,
    isValid: progress === 100,
    message: progress === 100 ? "Rosto detectado" : result.message,
    progress,
  };
};
