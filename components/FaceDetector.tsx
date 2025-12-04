import { validateFaceQuality } from "@/utils/face";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Camera,
  runAsync,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import {
  CommonFaceDetectionOptions,
  Face,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import Svg, { Ellipse } from "react-native-svg";
import AnimatedCountdown from "./ui/Coutdown";

interface FaceValidationResult {
  isValid: boolean;
  message: string;
  confidence: number;
  progress: number;
}

interface Props {
  takePhoto: (path: string) => Promise<void>;
}

const FaceDetector: React.FC<Props> = ({ takePhoto }) => {
  const camera = useRef<any>(null);
  const device = useCameraDevice("front");
  const faceDetectionOptions: CommonFaceDetectionOptions = {
    performanceMode: "accurate",
    landmarkMode: "all",
    contourMode: "all",
    classificationMode: "all",
    minFaceSize: 0.2,
  };
  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);
  const [isValidating, setIsValidating] = React.useState(false);
  const [faceDetected, setFaceDetected] = React.useState(false);
  const [photoTaken, setPhotoTaken] = React.useState(false);
  const [detectionProgress, setDetectionProgress] = React.useState(0); // 0-100%
  const [validationResult, setValidationResult] =
    React.useState<FaceValidationResult | null>(null);

  // flag para indicar se já estamos no processo de contar (delay ou intervalo)
  const captureInterval = useRef<NodeJS.Timeout | null>(null);
  const startDelayTimeout = useRef<NodeJS.Timeout | null>(null);
  const stableValidFace = useRef(false);
  const isCountingOrDelaying = useRef(false);

  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [freezeMessage, setFreezeMessage] = React.useState(false);

  if (!device) return null;

  const ovalWidth = 200;
  const ovalHeight = 300;
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const START_DELAY_MS = 1200; // ← espere 1.2s antes de começar o contador

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (startDelayTimeout.current) {
        clearTimeout(startDelayTimeout.current);
        startDelayTimeout.current = null;
      }
      if (captureInterval.current) {
        clearInterval(captureInterval.current);
        captureInterval.current = null;
      }
    };
  }, []);

  const handleValidationUpdate = Worklets.createRunOnJS(
    (isDetected: boolean, result: FaceValidationResult | null) => {
      if (photoTaken) {
        return;
      }

      if (!isDetected || !result) {
        setFaceDetected(false);
        setValidationResult(null);
        return;
      }

      setFaceDetected(true);
      setValidationResult(result);
      setDetectionProgress(result.progress);
      // Gerenciar lógica do timer e captura
      handleValidationState(result);
    }
  );

  const clearAllTimers = () => {
    if (startDelayTimeout.current) {
      clearTimeout(startDelayTimeout.current);
      startDelayTimeout.current = null;
    }
    if (captureInterval.current) {
      clearInterval(captureInterval.current);
      captureInterval.current = null;
    }
    isCountingOrDelaying.current = false;
    stableValidFace.current = false;
    setCountdown(null);
    setFreezeMessage(false);
  };

  const handleValidationState = Worklets.createRunOnJS(
    (validation: FaceValidationResult) => {
      const isStableNow = validation.isValid;

      // Se ficou inválido → cancelar tudo imediatamente
      if (!isStableNow) {
        clearAllTimers();
        return;
      }

      // Se já estamos no processo de delay/contagem, não reiniciar
      if (isCountingOrDelaying.current) {
        // ainda garantir stable flag
        stableValidFace.current = true;
        return;
      }

      // Marca que iniciamos processo
      isCountingOrDelaying.current = true;
      stableValidFace.current = true;
      setFreezeMessage(true);

      // Inicia o delay antes de começar a contagem
      startDelayTimeout.current = setTimeout(() => {
        // Se durante o delay foi invalidado, aborta
        if (!stableValidFace.current) {
          clearAllTimers();
          return;
        }

        // começa a contagem
        let currentCount = 3;
        setCountdown(currentCount);

        captureInterval.current = setInterval(() => {
          // se a face ficou inválida enquanto contávamos, aborta
          if (!stableValidFace.current) {
            clearAllTimers();
            return;
          }

          currentCount -= 1;
          setCountdown(currentCount);

          if (currentCount <= 0) {
            // prevent race: limpa antes de capturar
            clearAllTimers();

            // captura (se ainda não tirou)
            if (!photoTaken) {
              capturePhotoMock();
            }
          }
        }, 1000);

        startDelayTimeout.current = null;
      }, START_DELAY_MS);
    }
  );

  const capturePhotoMock = async () => {
    if (camera.current && !photoTaken) {
      const photo = await camera.current.takePhoto({
        flash: "off",
        qualityPrioritization: "balanced",
        enableAutoStabilization: true,
      });

      takePhoto(photo.path);
      setCountdown(null);
      setFreezeMessage(false);
      isCountingOrDelaying.current = false;
    }
  };

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";

      // Se a foto já foi capturada, não processar mais validações
      if (photoTaken) {
        return;
      }

      // Rodar direto no worklet — sem runAsync()
      const faces = detectFaces(frame);

      if (faces && faces.length > 0) {
        const validation = validateFaceQuality(faces[0]);
        handleValidationUpdate(true, validation);
      } else {
        handleValidationUpdate(false, null);
      }
    },
    [photoTaken, screenWidth, screenHeight]
  );

  const getStatusColor = () => {
    if (!faceDetected) return "#ff6b6b";
    if (photoTaken) return "#4ecdc4"; // Ciano quando foto foi tirada
    if (detectionProgress < 100) return "#ffd93d"; // Amarelo durante detecção
    if (validationResult?.isValid) return "#51cf66";
    if (!validationResult?.isValid) return "#ff6b6b";
    return "#51cf66"; // Verde quando face é detectada
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive
        photo
        frameProcessor={frameProcessor}
      />
      <View style={styles.overlay}>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: getStatusColor() },
          ]}
        >
          {isValidating && <ActivityIndicator size="small" color="white" />}
          <Text style={styles.statusText}>
            {freezeMessage
              ? "Não se mexa..."
              : validationResult?.message ||
                (faceDetected
                  ? "Detectando face..."
                  : "Posicione seu rosto na câmera")}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.faceGuide,
          {
            width: ovalWidth,
            height: ovalHeight,
            top: "50%",
            left: "50%",
            transform: [
              { translateX: -ovalWidth / 2 },
              { translateY: -ovalHeight / 2 },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Svg width={ovalWidth} height={ovalHeight}>
          {/* Borda principal que muda de cor */}
          <Ellipse
            cx={ovalWidth / 2}
            cy={ovalHeight / 2}
            rx={ovalWidth / 2 - 4}
            ry={ovalHeight / 2 - 4}
            stroke={getStatusColor()} // ← COR DO STATUS
            strokeWidth={4}
            fill="none"
            strokeDasharray="10 6" // ← borda tracejada (igual ao antigo faceOval)
            strokeLinecap="round"
          />

          {/* Borda cinza secundária fixa, só para dar referência */}
          <Ellipse
            cx={ovalWidth / 2}
            cy={ovalHeight / 2}
            rx={ovalWidth / 2 - 2}
            ry={ovalHeight / 2 - 2}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={2}
            fill="none"
          />
        </Svg>
      </View>
      {countdown !== null && (
        <View
          style={{
            position: "absolute",
            top: "38%",
            width: "100%",
            alignItems: "center",
          }}
        >
          <AnimatedCountdown value={countdown} />
        </View>
      )}
    </View>
  );
};

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
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  statusContainer: {
    position: "absolute",
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  faceGuide: {
    position: "absolute",
  },
  faceOval: {
    borderStyle: "dashed",
    borderWidth: 3,
    position: "absolute", // importantíssimo para sobrepor ao SVG
    top: 0,
    left: 0,
    // width/height e borderRadius aplicados inline
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  progressArcContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%", // ocupa exatamente o mesmo espaço do faceOval
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  progressBar: {
    position: "absolute",
    bottom: 150,
    width: 250,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 10,
  },
  progressText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default FaceDetector;
