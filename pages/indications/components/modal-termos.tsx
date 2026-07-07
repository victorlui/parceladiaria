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

type Props = {
  visible: boolean;
  onClose: () => void;
  termos: string | null;
  loading: boolean;
};

export default function ModalTermos({
  visible,
  onClose,
  termos,
  loading,
}: Props) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>Termos do programa</Text>

              <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.green.primary} />
                  <Text style={styles.loadingText}>Carregando termos...</Text>
                </View>
              ) : (
                <TermosBody termos={termos || ""} />
              )}
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
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
      minHeight: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 24,
      paddingTop: isSmallDevice ? 10 : 12,
      paddingBottom: isSmallDevice ? 12 : 14,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },
    title: {
      flex: 1,
      color: "#233047",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
    },
    content: {
      flex: 1,
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
