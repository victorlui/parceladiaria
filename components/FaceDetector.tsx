import { useFaceFrameProcessor } from "@/worklet/face-processor";
import React, { useCallback, useState } from "react";
import { Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { useNormalizedOval } from "@/liveness/useNormalizedOval";
import Animated, {
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

interface Props {
  takePhoto: (path: string) => Promise<void>;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const { width, height } = Dimensions.get("window");
const SQUARE_WIDTH = width * 0.7;
const SQUARE_HEIGHT = SQUARE_WIDTH * 1.25;

const FaceDetector: React.FC<Props> = ({ takePhoto }) => {
  const device = useCameraDevice("front");
  const camera = React.useRef<Camera>(null);
  const oval = useNormalizedOval();

  const {
    frameProcessor,
    isFaceInside,
    facePos,
    faceMessage,
    captureProgress,
    shouldTakePhoto,
  } = useFaceFrameProcessor(oval);

  // Função disparada no JS Thread
  const handleCapture = useCallback(async () => {
    try {
      if (camera.current) {
        console.log("Iniciando captura de foto...");
        const photo = await camera.current.takePhoto({
          flash: "off",
        });
        console.log("Sucesso! Caminho:", photo.path);

        // Resetamos o sinal para não tirar fotos repetidas
        shouldTakePhoto.value = false;
        await takePhoto(photo.path);
      }
    } catch (e) {
      console.error("Erro ao capturar:", e);
      shouldTakePhoto.value = false;
    }
  }, [takePhoto, shouldTakePhoto]);

  // Escuta o sinal da Worklet para disparar a função JS
  useAnimatedReaction(
    () => shouldTakePhoto.value,
    (isReady, previous) => {
      if (isReady && !previous) {
        runOnJS(handleCapture)();
      }
    },
    [handleCapture]
  );

  // Estilo animado que não causa re-render do componente
  const animatedGuideStyle = useAnimatedStyle(() => {
    return {
      // Transição suave de cor (250ms)
      borderColor: withTiming(isFaceInside.value ? "#00FF00" : "#FFFFFF", {
        duration: 250,
      }),
      // Pequeno efeito de escala para indicar que o rosto foi "capturado"
      transform: [
        {
          scale: withTiming(isFaceInside.value ? 1.05 : 1.0, { duration: 250 }),
        },
      ],
      // Aumentar a espessura da borda quando estiver correto
      borderWidth: withTiming(isFaceInside.value ? 5 : 2, { duration: 250 }),
    };
  }, [isFaceInside.value]);

  const debugStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
  }));

  //   const debugTextProps = useAnimatedProps(
  //     () =>
  //       ({
  //         text: `X: ${facePos.value.x.toFixed(2)} | Y: ${facePos.value.y.toFixed(2)}`,
  //         defaultValue: "",
  //       }) as any
  //   );

  const messageProps = useAnimatedProps(
    () =>
      ({
        text: faceMessage.value,
        value: faceMessage.value,
      }) as any
  );

  const countdownProps = useAnimatedProps(() => {
    // Converte o progresso (0 a 1) para 3, 2, 1
    const count = Math.ceil(3 - captureProgress.value * 3);
    return {
      text: captureProgress.value > 0 ? `${count}` : "",
      value: captureProgress.value > 0 ? `${count}` : "",
    } as any;
  });

  const animatedNumberStyle = useAnimatedStyle(() => ({
    opacity: captureProgress.value > 0 ? 1 : 0,
    transform: [{ scale: captureProgress.value > 0 ? 1 : 0.5 }],
  }));

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device!}
        frameProcessor={frameProcessor}
        isActive
        resizeMode="cover"
        pixelFormat="yuv"
        photo={true}
      />
      {/* <Animated.View style={debugStyle}>
        <AnimatedTextInput
          editable={false}
          style={{ color: "white", fontWeight: "bold" }}
          animatedProps={debugTextProps}
        />
        <Text style={{ color: "gray", fontSize: 10 }}>
          Alvo: CX 0.5 | CY 0.5
        </Text>
      </Animated.View> */}

      {/* Overlay de Mensagem - Posicionado para visibilidade clara */}
      <View style={styles.messageBadge}>
        <AnimatedTextInput
          editable={false}
          style={styles.messageText}
          animatedProps={messageProps}
        />
      </View>

      {/* O QUADRADO NO MEIO DA TELA */}
      <View style={styles.overlayContainer} pointerEvents="none">
        <View style={styles.guideSquareContainer}>
          {/* O número agora fica dentro do container do quadrado */}
          <AnimatedTextInput
            editable={false}
            style={[styles.countdownText, animatedNumberStyle]}
            animatedProps={countdownProps}
          />

          {/* A borda do quadrado */}
          <Animated.View style={[styles.guideSquare, animatedGuideStyle]} />
        </View>
      </View>
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
  overlay: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  text: {
    color: "#FFF",
    fontSize: 16,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  guideSquareContainer: {
    width: SQUARE_WIDTH,
    height: SQUARE_HEIGHT,
    justifyContent: "center", // Centraliza o número verticalmente
    alignItems: "center", // Centraliza o número horizontalmente
    position: "relative",
  },
  guideSquare: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  messageBadge: {
    position: "absolute",
    top: height * 0.15,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    zIndex: 10,
  },
  messageText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },

  countdownText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#FFF", // Cor verde para o número
    textAlign: "center",
  },
});

export default FaceDetector;
