import { useFrameProcessor } from "react-native-vision-camera";
import {
  CommonFaceDetectionOptions,
  useFaceDetector,
} from "react-native-vision-camera-face-detector";

export function useLivenessFrameProcessor(processFace: (face: any) => void) {
  const faceDetectionOptions: CommonFaceDetectionOptions = {
    performanceMode: "accurate",
    landmarkMode: "all",
    contourMode: "all",
    classificationMode: "all",
    minFaceSize: 0.2,
  };
  const { detectFaces } = useFaceDetector(faceDetectionOptions);

  return useFrameProcessor((frame) => {
    "worklet";

    const faces = detectFaces(frame);

    if (faces.length > 0) {
      processFace(faces[0]);
    }
  }, []);
}
