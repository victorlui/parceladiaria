import { isFaceInsideGuideWorklet } from "@/liveness/isFaceInsideGuide.worklet";
import { useMemo } from "react";
import { useSharedValue } from "react-native-reanimated";
import { useFrameProcessor } from "react-native-vision-camera";
import {
  useFaceDetector,
  CommonFaceDetectionOptions,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";

export function useFaceFrameProcessor(oval: any) {
  const isFaceInside = useSharedValue(false);
  const consecutiveFrames = useSharedValue(0);
  const faceMessage = useSharedValue("Iniciando...");
  const facePos = useSharedValue({ x: 0, y: 0, score: 0 });

  const captureProgress = useSharedValue(0);
  const shouldTakePhoto = useSharedValue(false);

  // Guardamos o momento em que o rosto estabilizou
  const startTime = useSharedValue(0);

  const THRESHOLD_FRAMES = 5;
  const CAPTURE_DELAY_MS = 3000; // 3 segundos exatos

  const faceDetectionOptions: CommonFaceDetectionOptions = useMemo(
    () => ({
      performanceMode: "accurate",
      landmarkMode: "none",
      classificationMode: "none",
      minFaceSize: 0.15,
      trackingEnabled: true,
    }),
    []
  );

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  const updateStatus = useMemo(
    () =>
      Worklets.createRunOnJS(
        (
          isInside: boolean,
          message: string,
          progress: number,
          takePhoto: boolean
        ) => {
          isFaceInside.value = isInside;
          faceMessage.value = message;
          captureProgress.value = progress;

          // Dispara o sinal apenas uma vez quando atingir 100%
          if (takePhoto && !shouldTakePhoto.value) {
            shouldTakePhoto.value = true;
          }
        }
      ),
    []
  );

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      const faces = detectFaces(frame);

      if (faces.length > 0) {
        const result = isFaceInsideGuideWorklet(faces[0], oval, frame);

        if (result.isInside) {
          consecutiveFrames.value = Math.min(
            consecutiveFrames.value + 1,
            THRESHOLD_FRAMES
          );
        } else {
          consecutiveFrames.value = 0;
          startTime.value = 0; // Reseta o cronômetro imediatamente se sair
          captureProgress.value = 0;
        }

        const isStable = consecutiveFrames.value >= THRESHOLD_FRAMES;
        let currentProgress = 0;
        let triggerCapture = false;

        if (isStable) {
          const now = Date.now();

          if (startTime.value === 0) {
            startTime.value = now;
          }

          const elapsed = now - startTime.value;
          currentProgress = Math.min(elapsed / CAPTURE_DELAY_MS, 1);

          if (currentProgress >= 1) {
            triggerCapture = true;
          }
        } else {
          startTime.value = 0;
          currentProgress = 0;
        }

        // Definição única da mensagem
        const msg = isStable
          ? "Perfeito! Mantenha assim"
          : result.distance === "too-far"
            ? "Aproxime o rosto"
            : result.distance === "too-close"
              ? "Afaste o rosto"
              : "Centralize o rosto";

        updateStatus(isStable, msg, currentProgress, triggerCapture);
      } else {
        consecutiveFrames.value = 0;
        startTime.value = 0;
        updateStatus(false, "Rosto não detectado", 0, false);
      }
    },
    [detectFaces, updateStatus, oval]
  );

  return {
    frameProcessor,
    isFaceInside,
    facePos,
    faceMessage,
    captureProgress,
    shouldTakePhoto,
  };
}
