import ButtonComponent from "../ui/Button";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { FontAwesome6, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera } from "react-native-vision-camera";
import FaceDetector from "../FaceDetector";

export const documentDisplayNames: Record<string, string> = {
  comprovante_endereco: "Comprovante de endereço",
  foto_perfil_app: "Perfil no App de Corridas",
  foto_perfil_app2: "Perfil em Outro App",
  foto_docveiculo: "Documento do Veículo",
  foto_veiculo: "Foto do Veículo",
  video_comercio: "Vídeo do Comércio",
  ganhos_app: "Relatório de Ganhos",
  foto_frente_doc: "Foto Frente do Documento",
  foto_verso_doc: "Foto Verso do Documento",
  fachada: "Foto da Fachada",
  video_fachada: "Vídeo da Fachada",
  video_interior: "Vídeo do Interior",
  mei: "Certificado de MEI",
  face: "Reconhecimento Facial",
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

  const getIconInfo = (item: string) => {
    if (item === "face") {
      return {
        icon: (
          <MaterialCommunityIcons
            name="face-recognition"
            size={24}
            color="#10B981"
          />
        ),
        bg: "#ECFDF5",
      };
    }
    if (
      item.includes("video") ||
      item === "ganhos_app" ||
      item.includes("video")
    ) {
      return {
        icon: <Ionicons name="videocam" size={24} color="#3B82F6" />,
        bg: "#EFF6FF",
      };
    }
    return {
      icon: <FontAwesome6 name="camera" size={22} color="#A855F7" />,
      bg: "#FAF5FF",
    };
  };

  const iconInfo = getIconInfo(item);
  const displayName = documentDisplayNames[item] || item;

  const handlePress = () => {
    if (item === "face") {
      requestPermission();
    } else {
      pickMedia(item);
    }
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

      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
          {iconInfo.icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{displayName}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: selectedUri ? "#10B981" : "#EA580C" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: selectedUri ? "#10B981" : "#EA580C" },
              ]}
            >
              {selectedUri ? "Arquivo Selecionado" : "Divergente - Reenviar"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={handlePress}>
          <Text style={styles.sendButtonText}>
            {selectedUri ? "Alterar" : "Enviar"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sendButton: {
    backgroundColor: Colors.green.button,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
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
});

export default ItemsDivergentes;