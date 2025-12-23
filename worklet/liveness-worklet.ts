import { useFrameProcessor } from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";
import {
  CommonFaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";

export function useLivenessFrameProcessor(
  processFace: (face: any, frame: { width: number; height: number }) => void
) {
  const faceDetectionOptions: CommonFaceDetectionOptions = {
    performanceMode: "accurate",
    landmarkMode: "all",
    contourMode: "all",
    classificationMode: "all",
    minFaceSize: 0.2,
  };

  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  // ✅ cria a ponte UMA VEZ
  const processFaceOnJS = useRunOnJS(processFace, [processFace]);

  return useFrameProcessor((frame) => {
    "worklet";

    const faces = detectFaces(frame);

    if (faces.length > 0) {
      processFaceOnJS(faces[0], {
        width: frame.width,
        height: frame.height,
      });
    }
  }, []);
}
