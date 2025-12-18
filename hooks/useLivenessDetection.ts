import { useSharedValue, useRunOnJS } from "react-native-worklets-core";
import { Dimensions, Platform } from "react-native";
import type { Face } from "react-native-vision-camera-face-detector";
import { LivenessStep } from "@/interfaces/liveness";

const HOLD_DURATION_MS = 3000;
const POSITION_TOLERANCE_PX = 12;
const ANGLE_TOLERANCE = 4;
const MIN_FACE_RATIO = 0.6;

export function useLivenessDetection(
  onSuccess: () => void,
  onFeedback: (msg: string, step: LivenessStep) => void
) {
  const step = useSharedValue<LivenessStep>("POSITION");
  const holdStartTime = useSharedValue<number | null>(null);
  const lastFace = useSharedValue<{
    x: number;
    y: number;
    yaw: number;
    pitch: number;
    roll: number;
  } | null>(null);

  const handleFeedback = useRunOnJS(onFeedback, []);
  const handleSuccess = useRunOnJS(onSuccess, []);

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

  // ================= GUIA OVAL =================
  const MAX_WIDTH = SCREEN_W * 0.85;
  const FACE_ASPECT_RATIO = 1.45;

  let guideWidth = Math.min(MAX_WIDTH, 320);
  let guideHeight = guideWidth * FACE_ASPECT_RATIO;

  if (guideHeight > SCREEN_H * 0.65) {
    guideHeight = SCREEN_H * 0.65;
    guideWidth = guideHeight / FACE_ASPECT_RATIO;
  }

  const guide = {
    width: guideWidth,
    height: guideHeight,
    x: (SCREEN_W - guideWidth) / 2,
    y: (SCREEN_H - guideHeight) / 2,
  };

  // ================= RESET TOTAL =================
  const resetLiveness = (message: string) => {
    "worklet";
    step.value = "POSITION";
    holdStartTime.value = null;
    lastFace.value = null;
    handleFeedback(message, "POSITION");
  };

  // ================= PROCESSAMENTO =================
  const processFace = (face: Face) => {
    "worklet";

    let { x, y, width, height } = face.bounds;

    // espelhamento Android
    if (Platform.OS === "android") {
      x = SCREEN_W - x - width;
    }

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const insideGuide =
      x >= guide.x &&
      y >= guide.y &&
      x + width <= guide.x + guide.width &&
      y + height <= guide.y + guide.height;

    // 🚨 SE SAIR DO GUIA → RESET IMEDIATO
    if (!insideGuide) {
      resetLiveness("Mantenha o rosto dentro do guia");
      return;
    }

    // 🚨 SE O ROSTO ESTIVER MUITO PEQUENO (LONGE)
    if (width < guide.width * MIN_FACE_RATIO) {
      resetLiveness("Aproxime o rosto");
      return;
    }

    // ================= POSITION =================
    if (step.value === "POSITION") {
      step.value = "HOLD_STILL";
      holdStartTime.value = null;
      lastFace.value = null;
      handleFeedback("Mantenha o rosto parado", "HOLD_STILL");
      return;
    }

    // ================= HOLD STILL =================
    if (step.value === "HOLD_STILL") {
      const now = Date.now();

      if (!lastFace.value) {
        lastFace.value = {
          x: centerX,
          y: centerY,
          yaw: face.yawAngle,
          pitch: face.pitchAngle,
          roll: face.rollAngle,
        };
        holdStartTime.value = now;
        return;
      }

      const dx = Math.abs(centerX - lastFace.value.x);
      const dy = Math.abs(centerY - lastFace.value.y);
      const dYaw = Math.abs(face.yawAngle - lastFace.value.yaw);
      const dPitch = Math.abs(face.pitchAngle - lastFace.value.pitch);
      const dRoll = Math.abs(face.rollAngle - lastFace.value.roll);

      const moved =
        dx > POSITION_TOLERANCE_PX ||
        dy > POSITION_TOLERANCE_PX ||
        dYaw > ANGLE_TOLERANCE ||
        dPitch > ANGLE_TOLERANCE ||
        dRoll > ANGLE_TOLERANCE;

      if (moved) {
        holdStartTime.value = now;
        lastFace.value = {
          x: centerX,
          y: centerY,
          yaw: face.yawAngle,
          pitch: face.pitchAngle,
          roll: face.rollAngle,
        };
        handleFeedback("Mantenha o rosto parado", "HOLD_STILL");
        return;
      }

      if (
        holdStartTime.value &&
        now - holdStartTime.value >= HOLD_DURATION_MS
      ) {
        step.value = "SUCCESS";
        handleFeedback("Prova de vida confirmada", "SUCCESS");
        handleSuccess();
      }
    }
  };

  return { processFace, guide };
}
