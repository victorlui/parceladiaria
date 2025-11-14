import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  const isVideoType = (documentType: string) =>
    documentType === "video_comercio" || documentType === "ganhos_app";

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{documentDisplayNames[item] || item}</Text>
      <TouchableOpacity style={styles.button} onPress={() => pickMedia(item)}>
        <FontAwesome6 name="upload" size={24} color={Colors.green.button} />
        {selectedUri ? (
          <Text style={styles.textButton}>{selectedUri}</Text>
        ) : (
          <Text style={styles.textButton}>Clique para enviar</Text>
        )}
        <Text style={styles.textButton2}>{isVideoType(item) ? "MP4" : "PNG, JPG ou PDF"}</Text>
      </TouchableOpacity>
    </View>
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
});

export default ItemsDivergentes;
