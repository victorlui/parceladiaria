import { Colors } from "@/constants/Colors";
import { useDocumentPicker } from "@/hooks/useDocumentPicker";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { documentDisplayNames } from "../utils/displayNames";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type Selected = {
  uri: string;
  name: string;
  type: "pdf" | "image" | "video";
  mimeType: string;
};

interface Props {
  item: string;
  initialSelected?: Selected | null;
  back: (selected: Selected | null) => void;
  onSubmit: (selected: Selected | null) => void;
}

const SendDocument: React.FC<Props> = ({
  item,
  initialSelected,
  back,
  onSubmit,
}) => {
  const insets = useSafeAreaInsets();
  const { selectPDF, takePhoto, takeVideo } = useDocumentPicker(10);
  const [selected, setSelected] = useState<Selected | null>(
    initialSelected ?? null,
  );
  const previousItemRef = React.useRef(item);

  useEffect(() => {
    if (previousItemRef.current === item) return;

    previousItemRef.current = item;
    setSelected(initialSelected ?? null);
  }, [item, initialSelected]);

  const handlePick = async (
    type: "camera" | "library" | "pdf" | "video_library" | "video_camera",
  ) => {
    let file;
    if (type === "pdf") file = await selectPDF();
    else if (type === "video_library") file = await takeVideo("library");
    else if (type === "video_camera") file = await takeVideo("camera");
    else file = await takePhoto(type);

    if (file) setSelected(file as unknown as Selected);
  };

  const displayName = documentDisplayNames[item] || item;
  const isVideoItem = item === "video_perfil_app" || item === "ganhos_app";
  const handleBack = () => back(selected);
  const actionButtons = [
    {
      icon: "camera",
      label: isVideoItem ? "Gravar" : "Câmera",
      onPress: () => handlePick(isVideoItem ? "video_camera" : "camera"),
    },
    {
      icon: "images",
      label: "Galeria",
      onPress: () => handlePick(isVideoItem ? "video_library" : "library"),
    },
    ...(!isVideoItem
      ? [
          {
            icon: "file-tray-full",
            label: "Arquivo",
            onPress: () => handlePick("pdf"),
          },
        ]
      : []),
  ];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header Minimalista */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setSelected(null)}
        >
          <Ionicons name="refresh-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        {/* Área de Visualização/Seleção Centralizada */}
        <View style={styles.dropZone}>
          {!selected ? (
            <View style={styles.placeholder}>
              <View style={styles.uploadIconCircle}>
                <Ionicons
                  name="cloud-upload"
                  size={40}
                  color={Colors.green.button}
                />
              </View>
              <Text style={styles.mainInstruction}>
                Selecione seu documento
              </Text>
              <Text style={styles.subInstruction}>
                Toque em uma das opções abaixo
              </Text>
            </View>
          ) : (
            <View style={styles.previewContainer}>
              {selected.type === "image" ? (
                <Image
                  source={{ uri: selected.uri }}
                  style={styles.fullPreview}
                  resizeMode="cover"
                />
              ) : selected.type === "video" ? (
                <View style={styles.pdfPlaceholder}>
                  <Ionicons name="videocam" size={80} color="#7C3AED" />
                  <Text style={styles.pdfName}>{selected.name}</Text>
                </View>
              ) : (
                <View style={styles.pdfPlaceholder}>
                  <Ionicons name="document-text" size={80} color="#3B82F6" />
                  <Text style={styles.pdfName}>{selected.name}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeBadge}
                onPress={() => setSelected(null)}
              >
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Botões de Ação Dinâmicos */}
        <View style={styles.actionRow}>
          {actionButtons.map((action) => (
            <ActionButton
              key={action.label}
              icon={action.icon}
              label={action.label}
              onPress={action.onPress}
              compact={actionButtons.length === 3}
            />
          ))}
        </View>
      </View>

      {/* Botão de Rodapé Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
          disabled={!selected}
          onPress={() => onSubmit(selected)}
        >
          <Text style={styles.submitBtnText}>Enviar Agora</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Componente Interno para os botões de seleção
const ActionButton = ({ icon, label, onPress, compact }: any) => (
  <TouchableOpacity
    style={[
      styles.actionBtn,
      compact ? styles.actionBtnCompact : styles.actionBtnWide,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.actionIconArea}>
      <Ionicons name={icon} size={24} color={Colors.green.button} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  main: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  dropZone: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.45,
    backgroundColor: "#F8FAFC",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    alignItems: "center",
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainInstruction: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
  },
  subInstruction: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
  },
  previewContainer: {
    width: "100%",
    height: "100%",
  },
  fullPreview: {
    width: "100%",
    height: "100%",
  },
  pdfPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pdfName: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  removeBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 18,
    rowGap: 12,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionBtnCompact: {
    width: "31%",
  },
  actionBtnWide: {
    width: "48%",
  },
  actionIconArea: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  submitBtn: {
    backgroundColor: Colors.green.button,
    height: 65,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    // Sombra para dar profundidade
    shadowColor: Colors.green.button,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#E2E8F0",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default SendDocument;
