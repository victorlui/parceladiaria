import { Dimensions, Platform } from "react-native";
import { LivenessStep } from "@/interfaces/liveness";
import { useRef } from "react";

const HOLD_DURATION_MS = 3000;
const POSITION_TOLERANCE = 16;
const MIN_FACE_RATIO = Platform.OS === "ios" ? 0.4 : 0.6;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export function useLivenessDetection(
  onSuccess: () => void,
  onFeedback: (msg: string, step: LivenessStep) => void
) {
  const step = useRef<LivenessStep>("POSITION");
  const holdStart = useRef<number | null>(null);
  const last = useRef<any>(null);

  /* ================= GUIA ================= */

  const guideWidth = Math.min(SCREEN_W * 0.85, 320);
  const guideHeight = guideWidth * 1.45;

  const guide = {
    width: guideWidth,
    height: guideHeight,
    x: (SCREEN_W - guideWidth) / 2,
    y: (SCREEN_H - guideHeight) / 2,
  };

  /* ================= FRAME → TELA ================= */

  function mapToScreen(face: any, frame: any) {
    let { x, y, width, height } = face.bounds;

    if (Platform.OS === "android") {
      x = frame.width - x - width;
    }

    const frameRatio = frame.width / frame.height;
    const screenRatio = SCREEN_W / SCREEN_H;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (screenRatio > frameRatio) {
      scale = SCREEN_W / frame.width;
      offsetY = (frame.height * scale - SCREEN_H) / 2;
    } else {
      scale = SCREEN_H / frame.height;
      offsetX = (frame.width * scale - SCREEN_W) / 2;
    }

    const sx = x * scale - offsetX;
    const sy = y * scale - offsetY;
    const sw = width * scale;
    const sh = height * scale;

    return {
      centerX: sx + sw / 2,
      centerY: sy + sh / 2,
      width: sw,
    };
  }

  /* ================= PROCESSAMENTO ================= */

  function processFace(face: any, frame: any) {
    const mapped = mapToScreen(face, frame);

    const insideGuide =
      mapped.centerX >= guide.x &&
      mapped.centerX <= guide.x + guide.width &&
      mapped.centerY >= guide.y &&
      mapped.centerY <= guide.y + guide.height;

    if (!insideGuide) {
      reset("Mantenha o rosto dentro do guia");
      return;
    }

    if (mapped.width < guide.width * MIN_FACE_RATIO) {
      reset("Aproxime o rosto");
      return;
    }

    if (step.current === "POSITION") {
      step.current = "HOLD_STILL";
      holdStart.current = Date.now();
      last.current = mapped;
      onFeedback("Mantenha o rosto parado", "HOLD_STILL");
      return;
    }

    if (step.current === "HOLD_STILL") {
      const dx = Math.abs(mapped.centerX - last.current.centerX);
      const dy = Math.abs(mapped.centerY - last.current.centerY);

      if (dx > POSITION_TOLERANCE || dy > POSITION_TOLERANCE) {
        holdStart.current = Date.now();
        last.current = mapped;
        return;
      }

      if (Date.now() - holdStart.current! >= HOLD_DURATION_MS) {
        step.current = "SUCCESS";
        onFeedback("Prova de vida confirmada", "SUCCESS");
        onSuccess();
      }
    }
  }

  function reset(msg: string) {
    step.current = "POSITION";
    holdStart.current = null;
    last.current = null;
    onFeedback(msg, "POSITION");
  }

  return { processFace, guide };
}
