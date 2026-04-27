import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import * as Network from "expo-network";
import {
  Camera,
  runAsync,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import {
  FrameFaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import { Canvas, FillType, Path, Skia } from "@shopify/react-native-skia";
import { uploadRawFile } from "@/hooks/useUploadDocument";
import { useSettingsStore } from "@/store/settings";
import { useAuthStore } from "@/store/auth";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import api from "@/services/api";
import { Etapas } from "@/utils";

const { width, height } = Dimensions.get("window");

const GUIDE_WIDTH = width * 0.58;
const GUIDE_HEIGHT = height * 0.42;
const GUIDE_X = (width - GUIDE_WIDTH) / 2;
const GUIDE_Y = (height - GUIDE_HEIGHT) / 2 - 20;
const GUIDE_CENTER_X = GUIDE_X + GUIDE_WIDTH / 2;
const GUIDE_CENTER_Y = GUIDE_Y + GUIDE_HEIGHT / 2;
const CENTER_TOLERANCE = GUIDE_WIDTH * 0.14;
const IS_IOS = Platform.OS === "ios";
const OK_FRAMES_TO_CONFIRM = 6;
const NOK_FRAMES_TO_RESET = 3;

type AlignmentStatus =
  | "no_face"
  | "off_center"
  | "too_far"
  | "too_close"
  | "ok";

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.spinnerWrapper}>
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.spinnerLogo}
        resizeMode="contain"
      />
    </View>

    <Text style={styles.loadingText}>Enviando imagem, favor aguarde...</Text>
  </View>
);

export default function FaceDetector() {
  const { mutateAsync: updateUser } = useUpdateUserMutation();
  const { openfinance } = useSettingsStore();
  const { tokenRegister } = useAuthStore();
  const device = useCameraDevice("front");
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [alignmentStatus, setAlignmentStatus] =
    useState<AlignmentStatus>("no_face");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastPhotoPath, setLastPhotoPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const centeredFaceSV = useSharedValue(false);
  const alignmentStatusSV = useSharedValue<AlignmentStatus>("no_face");
  const okFramesSV = useSharedValue(0);
  const notOkFramesSV = useSharedValue(0);

  const guidePath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addOval(Skia.XYWHRect(GUIDE_X, GUIDE_Y, GUIDE_WIDTH, GUIDE_HEIGHT));
    return p;
  }, []);

  const maskPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRect(Skia.XYWHRect(0, 0, width, height));
    p.addOval(Skia.XYWHRect(GUIDE_X, GUIDE_Y, GUIDE_WIDTH, GUIDE_HEIGHT));
    p.setFillType(FillType.EvenOdd);
    return p;
  }, []);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    })();
  }, []);

  const faceDetectionOptions = useRef<FrameFaceDetectionOptions>({
    performanceMode: "fast",
    landmarkMode: "none",
    contourMode: "none",
    classificationMode: "none",
    minFaceSize: 0.15,
    trackingEnabled: false,
    cameraFacing: "front",
    autoMode: true,
    windowWidth: width,
    windowHeight: height,
  }).current;

  const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);

  useEffect(() => {
    return () => {
      stopListeners();
    };
  }, [stopListeners]);

  const updateAlignment = useCallback((status: AlignmentStatus) => {
    const centered = status === "ok";
    setAlignmentStatus(status);
    setIsCentered(centered);
    if (!centered) {
      setCountdown(null);
      setLastPhotoPath(null);
    }
  }, []);

  const updateAlignmentOnJS = Worklets.createRunOnJS(updateAlignment);

  const frameProcessor = useFrameProcessor(
    (frame: any) => {
      "worklet";

      runAsync(frame, () => {
        "worklet";
        const faces: any[] = detectFaces(frame) as any[];

        let status: AlignmentStatus = "no_face";

        if (faces.length === 1) {
          const b: any = faces[0]?.bounds;
          const x = typeof b?.x === "number" ? b.x : b?.origin?.x;
          const y = typeof b?.y === "number" ? b.y : b?.origin?.y;
          const w = typeof b?.width === "number" ? b.width : b?.size?.width;
          const h = typeof b?.height === "number" ? b.height : b?.size?.height;

          if (
            typeof x === "number" &&
            typeof y === "number" &&
            typeof w === "number" &&
            typeof h === "number"
          ) {
            const rawFaceCenterX = x + w / 2;
            const faceCenterX = IS_IOS
              ? width - rawFaceCenterX
              : rawFaceCenterX;
            const faceCenterY = y + h / 2;
            const inCenter =
              Math.abs(faceCenterX - GUIDE_CENTER_X) <= CENTER_TOLERANCE &&
              Math.abs(faceCenterY - GUIDE_CENTER_Y) <= CENTER_TOLERANCE;

            const minSizeFactor = IS_IOS ? 0.68 : 0.65;
            const isTooFar =
              w < GUIDE_WIDTH * minSizeFactor ||
              h < GUIDE_HEIGHT * minSizeFactor;

            const maxSizeFactor = 0.95;
            const isTooClose =
              w > GUIDE_WIDTH * maxSizeFactor ||
              h > GUIDE_HEIGHT * maxSizeFactor;

            if (isTooFar) {
              status = "too_far";
            } else if (isTooClose) {
              status = "too_close";
            } else if (!inCenter) {
              status = "off_center";
            } else {
              status = "ok";
            }
          }
        }

        const rawStatus = status;
        let stableStatus: AlignmentStatus = rawStatus;

        if (rawStatus === "ok") {
          okFramesSV.value += 1;
          notOkFramesSV.value = 0;
          if (okFramesSV.value < OK_FRAMES_TO_CONFIRM) {
            stableStatus = alignmentStatusSV.value;
          }
        } else {
          okFramesSV.value = 0;
          notOkFramesSV.value += 1;
          if (
            alignmentStatusSV.value === "ok" &&
            notOkFramesSV.value < NOK_FRAMES_TO_RESET
          ) {
            stableStatus = "ok";
          }
        }

        const centered = stableStatus === "ok";
        if (
          centeredFaceSV.value !== centered ||
          alignmentStatusSV.value !== stableStatus
        ) {
          centeredFaceSV.value = centered;
          alignmentStatusSV.value = stableStatus;
          updateAlignmentOnJS(stableStatus);
        }
      });
    },
    [detectFaces, updateAlignmentOnJS],
  );

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    const { isInternetReachable } = await Network.getNetworkStateAsync();
    if (isInternetReachable === false) {
      Alert.alert(
        "Sem conexão",
        "Verifique sua conexão com a internet e tente novamente.",
      );
      return;
    }

    setIsLoading(true);

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({ flash: "off" });
      const finalUrl = await uploadRawFile({
        uri: `file://${photo.path}`,
        name: `selfie-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
      });

      if (!finalUrl) {
        setIsLoading(false);
        return;
      }

      if (openfinance?.openfinance.motorista.eco) {
        await api.get(`/v1/klavi`, {
          headers: {
            Authorization: `Bearer ${tokenRegister}`,
          },
        });
      }

      await updateUser({
        request: {
          etapa: openfinance?.openfinance.motorista.connect
            ? Etapas.OPEN_FINANCE
            : Etapas.ACEITANDO_TERMOS,
          face: finalUrl,
        },
      });
    } finally {
      const { isInternetReachable } = await Network.getNetworkStateAsync();
      if (isInternetReachable === false) {
        Alert.alert(
          "Conexão perdida",
          "Sua internet caiu durante o envio. Verifique a conexão e tente novamente.",
        );
      }
      setIsLoading(false);
      setIsCapturing(false);
      setCountdown(null);
    }
  }, [isCapturing]);

  useEffect(() => {
    if (!isCentered || isCapturing || lastPhotoPath) {
      setCountdown(null);
      return;
    }

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [capturePhoto, isCentered, isCapturing, lastPhotoPath]);

  if (!hasPermission)
    return <Text style={styles.info}>Aguardando permissão...</Text>;
  if (!device) return <Text style={styles.info}>Sem câmera disponível</Text>;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />

      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path path={maskPath} color="#000000" style="fill" />
        <Path
          path={guidePath}
          color={isCentered ? "#22C55E" : "#FFFFFF"}
          style="stroke"
          strokeWidth={4}
        />
      </Canvas>

      <View style={styles.hud} pointerEvents="none">
        <Text
          style={[styles.status, { color: isCentered ? "#22C55E" : "#F59E0B" }]}
        >
          {alignmentStatus === "ok" && "Rosto alinhado"}
          {alignmentStatus === "too_far" && "Aproxime-se mais"}
          {alignmentStatus === "too_close" && "Afaste-se"}
          {alignmentStatus === "off_center" && "Não centralizado"}
          {alignmentStatus === "no_face" && "Posicione o rosto no centro"}
        </Text>
        {countdown !== null ? (
          <Text style={styles.countdown}>{countdown}</Text>
        ) : null}
        {isCapturing ? (
          <Text style={styles.status}>Capturando foto...</Text>
        ) : null}
        {lastPhotoPath ? (
          <Text style={styles.status}>Foto capturada com sucesso</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  hud: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 72,
    paddingHorizontal: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  status: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  countdown: {
    color: "#FFFFFF",
    fontSize: 64,
    fontWeight: "800",
    marginTop: 12,
  },
  info: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#000",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  spinnerWrapper: {
    width: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerLogo: {
    height: 260,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
