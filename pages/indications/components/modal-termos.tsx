import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TermosBody } from "./termos";
import { TermosFooter } from "./termos-footer";

type Props = {
  visible: boolean;
  onClose: () => void;
  termos: string | null;
  loading: boolean;
  showAcceptButton?: boolean;
  loadingAccept?: boolean;
  onAccept?: () => void;
  subtitle?: boolean;
};

export default function ModalTermos({
  visible,
  onClose,
  termos,
  loading,
  showAcceptButton = false,
  loadingAccept = false,
  onAccept,
  subtitle,
}: Props) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const [accepted, setAccepted] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setAccepted(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalCard}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Termos do programa</Text>
                {subtitle && (
                  <Text style={styles.subtitle}>
                    Para participar do programa de indicação, você precisa
                    aceitar os termos abaixo
                  </Text>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={Colors.green.primary}
                  />
                  <Text style={styles.loadingText}>Carregando termos...</Text>
                </View>
              ) : (
                <TermosBody termos={termos || ""} />
              )}
            </View>

            {showAcceptButton ? (
              <TermosFooter
                accepted={accepted}
                loadingAccept={loadingAccept}
                toggleAccepted={() => setAccepted((prev) => !prev)}
                acceptTermos={() => onAccept?.()}
                checkboxLabel="Li e aceito os Termos do Programa de Indicações"
              />
            ) : null}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.5)",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
      flex: 1,
      maxHeight: "90%",
      borderRadius: isSmallDevice ? 20 : 24,
      backgroundColor: Colors.white,
      overflow: "hidden",
    },
    safeArea: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    header: {
      minHeight: 76,
      justifyContent: "center",
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 24,
      paddingTop: isSmallDevice ? 10 : 12,
      paddingBottom: isSmallDevice ? 12 : 14,
      paddingRight: isSmallDevice ? 56 : 60,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      position: "relative",
    },
    headerTextContainer: {
      gap: 4,
    },
    title: {
      color: "#233047",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
    },
    subtitle: {
      color: "#64748B",
      fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
      lineHeight: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
      fontWeight: "400",
    },
    closeButton: {
      width: isSmallDevice ? 34 : 36,
      height: isSmallDevice ? 34 : 36,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      position: "absolute",
      top: isSmallDevice ? 10 : 12,
      right: isSmallDevice ? 18 : isMediumDevice ? 22 : 24,
      zIndex: 2,
    },
    content: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      color: "#475569",
      fontSize: isSmallDevice ? 13 : 14,
      lineHeight: isSmallDevice ? 20 : 22,
      fontWeight: "500",
    },
  });
};
