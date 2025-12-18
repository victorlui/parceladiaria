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

  const { width, height } = frameSize;
  console.log("width", width);
  console.log("height", height);
  console.log("face", face);

  return {
    isValid: true,
    message: "Face válida",
    confidence: 0,
    progress: 1,
  };
};
