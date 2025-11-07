import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import WebView from "react-native-webview";
import { Colors } from "@/constants/Colors";

interface ModalTermsProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  htmlContent?: string;
}

const ModalTerms: React.FC<ModalTermsProps> = ({
  visible,
  onClose,
  title = "Termos e Condições de Uso",
  htmlContent = "",
}) => {
  const isEmpty = !htmlContent || htmlContent.trim().length === 0;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isEmpty ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.green.primary} />
              <Text style={styles.loadingText}>Carregando termos...</Text>
            </View>
          ) : (
            <View style={styles.webviewContainer}>
              <WebView
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator
                showsHorizontalScrollIndicator={false}
                scrollEnabled
                nestedScrollEnabled
                startInLoadingState
                scalesPageToFit={false}
                javaScriptEnabled={false}
                domStorageEnabled={false}
                allowsInlineMediaPlayback={false}
                mediaPlaybackRequiresUserAction
                bounces={false}
              />
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={onClose} style={styles.footerButton}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
            <Text style={styles.footerButtonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ModalTerms;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  closeButton: { padding: 6 },
  content: { flex: 1, padding: 16 },
  webviewContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  loadingBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: { fontSize: 14, color: "#4B5563" },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: Colors.white,
  },
  footerButton: {
    backgroundColor: Colors.green.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerButtonText: { fontSize: 16, fontWeight: "600", color: Colors.white },
});