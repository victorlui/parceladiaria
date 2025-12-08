import ButtonComponent from "../ui/Button";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { FontAwesome6 } from "@expo/vector-icons";
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera } from "react-native-vision-camera";
import FaceDetector from "../FaceDetector";

export const documentDisplayNames: Record<string, string> = {
  comprovante_endereco: "Comprovante de endereço",
  foto_perfil_app: "Perfil Completo no Aplicativo de Corridas",
  foto_perfil_app2: "Perfil Completo em Outro Aplicativo de Corridas",
  foto_docveiculo: "Foto Documento do Veículo",
  foto_veiculo: "Foto do Veículo",
  video_comercio: "Vídeo do comercio",
  ganhos_app: "Video do Relatório de Ganhos no App de Corridas",
  foto_frente_doc: "Foto frente do documento",
  foto_verso_doc: "Foto verso do documento",
  fachada: "Foto da Fachada do Comércio",
  mei: "Certificado de MEI",
  face: "Reconhecimento facial",
};

interface Props {
  item: string;
  onSelect: (documentType: string, uri: string, name: string) => void;
  selectedUri?: string;
}

const ItemsDivergentes: React.FC<Props> = ({ item, onSelect, selectedUri }) => {
  const { takePhoto, takeVideo } = useDocumentPicker(100);
  const [showFaceDetector, setShowFaceDetector] = React.useState(false);

  const requestPermission = async () => {
    const status = await Camera.requestCameraPermission();
    if (status === "denied") {
      Alert.alert(
        "Permissão necessária",
        "Você negou o acesso à câmera. Para usar esta função, ative a câmera nas Configurações.",
        [{ text: "OK", style: "cancel" }]
      );
    }

    setShowFaceDetector(true);
  };

  const isVideoType = (documentType: string) =>
    documentType.startsWith("video") || documentType === "ganhos_app";

  const buildFileName = (
    documentType: string,
    originalName?: string,
    uri?: string
  ) => {
    const baseName = documentType;
    const source =
      originalName || (uri ? uri.split("?")[0].split("/").pop() || "" : "");
    const matchExt = source.match(/\.([a-zA-Z0-9]+)$/);
    const ext = matchExt ? matchExt[1].toLowerCase() : "";
    return ext ? `${baseName}.${ext}` : baseName;
  };

  const pickMedia = async (documentType: string) => {
    const pickerResult = isVideoType(documentType)
      ? await takeVideo("library")
      : await takePhoto("library");

    if (pickerResult && pickerResult.uri) {
      const newName = buildFileName(
        documentType,
        pickerResult.name,
        pickerResult.uri
      );
      onSelect(documentType, pickerResult.uri, newName);
    }
  };

  const sendPhoto = async (photo: string) => {
    setShowFaceDetector(false);
    const uri = photo.startsWith("file://") ? photo : `file://${photo}`;
    onSelect(item, uri, `face_${Date.now()}.jpg`);
  };

  return (
    <>
      <Modal
        visible={showFaceDetector}
        animationType="slide"
        onRequestClose={() => setShowFaceDetector(false)}
      >
        <View style={{ flex: 1 }}>
          <FaceDetector takePhoto={sendPhoto} />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFaceDetector(false)}
          >
            <FontAwesome6 name="xmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.container}>
        <Text style={styles.title}>{documentDisplayNames[item] || item}</Text>

        {item === "face" && (
          <>
            {selectedUri && (
              <Image
                source={{ uri: selectedUri }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <ButtonComponent
              title={
                selectedUri
                  ? "Refazer Reconhecimento Facial"
                  : "Fazer Reconhecimento Facial"
              }
              iconLeft="camera"
              iconRight={null}
              onPress={requestPermission}
            />
          </>
        )}

        {item !== "face" && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => pickMedia(item)}
          >
            <FontAwesome6 name="upload" size={24} color={Colors.green.button} />
            {selectedUri ? (
              <Text style={styles.textButton}>{selectedUri}</Text>
            ) : (
              <Text style={styles.textButton}>Clique para enviar</Text>
            )}
            <Text style={styles.textButton2}>
              {isVideoType(item) ? "MP4" : "PNG, JPG ou PDF"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderStyle: "dotted",
    borderColor: Colors.gray.primary,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  textButton: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: "bold",
  },
  textButton2: {
    color: Colors.gray.text,
    fontSize: 12,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  previewImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
});

export default ItemsDivergentes;
