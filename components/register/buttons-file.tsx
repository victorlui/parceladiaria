import React from "react";
import { StyleSheet, View } from "react-native";
import ButtonComponent from "../ui/Button";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";

interface Props {
  photo?: boolean;
  pdf?: boolean;
  video?: boolean;
  library?: boolean;
  sendFile: (file: File) => Promise<void>;
  isLoading?: boolean;
}

const SendFilesButtons: React.FC<Props> = ({
  photo = true,
  pdf = true,
  sendFile,
  isLoading = false,
  video = false,
  library = false,
}) => {
  const { selectPDF, takePhoto, takeVideo } = useDocumentPicker(10);

  const handleTakePhoto = async () => {
    const selected = await takePhoto("camera");
    if (selected) {
      sendFile(selected as unknown as File);
    }
  };

  const handleSelectLibrary = async () => {
    const selected = await takePhoto("library");
    if (selected) {
      sendFile(selected as unknown as File);
    }
  };

  const handleSelectPDF = async () => {
    const selected = await selectPDF();
    if (selected) {
      sendFile(selected as unknown as File);
    }
  };

  const handleTakeVideo = async () => {
    const selected = await takeVideo("library");
    if (selected) {
      sendFile(selected as unknown as File);
    }
  };

  return (
    <View style={styles.container}>
      {photo && (
        <ButtonComponent
          title="Abrir Câmera"
          onPress={handleTakePhoto}
          iconLeft="camera-outline"
          iconRight={null}
        />
      )}
      {pdf && (
        <ButtonComponent
          title="Anexar PDF"
          onPress={handleSelectPDF}
          iconLeft="document"
          iconRight={null}
          outline
        />
      )}
      {video && (
        <ButtonComponent
          title="Enviar Vídeo Gravado"
          onPress={handleTakeVideo}
          iconLeft="videocam"
          iconRight={null}
        />
      )}
      {library && (
        <ButtonComponent
          title="Anexar"
          onPress={handleSelectLibrary}
          iconLeft="file"
          iconRight={null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginVertical: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
});

export default SendFilesButtons;
