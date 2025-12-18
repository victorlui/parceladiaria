import { useLivenessDetection } from "@/hooks/useLivenessDetection";
import { LivenessStep } from "@/interfaces/liveness";
import { useLivenessFrameProcessor } from "@/worklet/liveness-worklet";
import React, { useEffect, useState, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";

interface Props {
  takePhoto: (path: string) => Promise<void>;
}

const HOLD_DURATION_MS = 3000;

const FaceDetector: React.FC<Props> = ({ takePhoto }) => {
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === "front");
  const camera = useRef<Camera>(null);

  const [feedback, setFeedback] = useState("Centralize o rosto");
  const [step, setStep] = useState<LivenessStep>("POSITION");
  const [timer, setTimer] = useState(0);

  const { processFace, guide } = useLivenessDetection(
    async () => {
      if (camera.current) {
        try {
          const photo = await camera.current.takePhoto({ flash: "off" });
          await takePhoto(photo.path);
        } catch (error) {
          console.error("Erro ao tirar foto:", error);
        }
      }
    },
    (msg: string, currentStep: LivenessStep) => {
      setFeedback(msg);
      setStep(currentStep);

      // Se entrar ou reiniciar o HOLD_STILL, reseta o timer
      if (currentStep === "HOLD_STILL") {
        setTimer(HOLD_DURATION_MS);
      } else {
        setTimer(0);
      }
    }
  );

  // ================= TIMER LOGIC =================
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (step === "HOLD_STILL") {
      interval = setInterval(() => {
        setTimer((prev) => Math.max(prev - 100, 0));
      }, 100);
    }

    return () => clearInterval(interval);
  }, [step]);

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Carregando câmera...</Text>
      </View>
    );
  }

  const frameProcessor = useLivenessFrameProcessor(processFace);

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo={true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />

      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Guia oval */}
      <View
        style={[
          styles.guide,
          {
            width: guide.width,
            height: guide.height,
            left: guide.x,
            top: guide.y,
            borderRadius: guide.width / 2,
            borderColor: guideColor(step),
          },
        ]}
      />

      {/* TIMER MODERNO */}
      {step === "HOLD_STILL" && (
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{Math.ceil(timer / 1000)}</Text>
          </View>
        </View>
      )}

      {/* Feedback */}
      <View style={styles.feedback}>
        <Text style={styles.text}>{feedback}</Text>
      </View>
    </View>
  );
};

// ================= CORES =================
function guideColor(step: LivenessStep) {
  switch (step) {
    case "POSITION":
      return "#FACC15";
    case "HOLD_STILL":
      return "#3B82F6";
    case "SUCCESS":
      return "#22C55E";
    default:
      return "#FACC15";
  }
}
const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: "black",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  guide: {
    position: "absolute",
    borderWidth: 3,
  },
  feedback: {
    position: "absolute",
    bottom: height * 0.08,
    width: "100%",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  // ===== TIMER MODERNO =====
  timerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  timerText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "700",
  },
});

export default FaceDetector;
