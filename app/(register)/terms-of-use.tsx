import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { WebView } from "react-native-webview";
import { Asset } from "expo-asset";
import { File, Paths } from "expo-file-system";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import LogoComponent from "@/components/ui/Logo";

export default function TermsOfUse() {
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHtml = async () => {
      try {
        const asset = Asset.fromModule(require("@/assets/termodeuso.html"));
        await asset.downloadAsync();
        // 2️⃣ Garante o caminho local
        const fileUri = asset.localUri || asset.uri;
        if (!fileUri) throw new Error("URI do termo de uso inválida");

        const response = await fetch(fileUri);
        const html = await response.text();

        // CSS simplificado para evitar conflitos
        const cssStyle = `
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 16px;
              line-height: 1.5;
              padding: 16px;
              margin: 0;
              color: #333;
              background-color: #fff;
            }
            h1, h2, h3, h4, h5, h6 {
              font-weight: 600;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #111;
            }
            h1 { font-size: 22px; }
            h2 { font-size: 20px; }
            h3 { font-size: 18px; }
            p {
              font-size: 16px;
              margin-bottom: 10px;
              text-align: justify;
            }
            ul, ol {
              padding-left: 20px;
              margin-bottom: 10px;
            }
            li {
              font-size: 16px;
              margin-bottom: 6px;
            }
            strong, b {
              font-weight: 600;
              color: #111;
            }
          </style>
        `;

        const finalHtml = `<html><head>${cssStyle}</head><body>${html}</body></html>`;
        setHtmlContent(finalHtml);
      } catch (error) {
        setHtmlContent(
          "<html><head><style>body{font-size:16px;padding:16px;}</style></head><body><p>Erro ao carregar os termos de uso. Tente novamente.</p></body></html>"
        );
        return error;
      }
    };

    loadHtml();
  }, []);

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push({ pathname: "/(register)/phone-screen" });
      setIsLoading(false);
    }, 300);
  };

  const handleBack = () => {
    router.back();
  };

  if (!htmlContent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <MaterialIcons name="hourglass-empty" size={40} color="#9BD13D" />
            <Text style={styles.loadingText}>Carregando termos de uso...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.content}>
            {/* Header com botão de voltar */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* Logo */}
            <LogoComponent logoWithText={false} height={100} />

            {/* Card de boas-vindas */}
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Termos e Condições</Text>
              <Text style={styles.welcomeSubtitle}>
                Leia atentamente nossos termos de uso antes de continuar
              </Text>
            </View>

            {/* Card dos termos */}
            <View style={styles.termsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Termos de Uso</Text>
              </View>

              <View style={styles.webViewContainer}>
                <WebView
                  originWhitelist={["*"]}
                  source={{ html: htmlContent }}
                  style={styles.webView}
                  showsVerticalScrollIndicator={true}
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  scalesPageToFit={false}
                  startInLoadingState={true}
                  javaScriptEnabled={false}
                  domStorageEnabled={false}
                  allowsInlineMediaPlayback={false}
                  mediaPlaybackRequiresUserAction={true}
                  bounces={false}
                  renderLoading={() => (
                    <View style={styles.webViewLoading}>
                      <MaterialIcons
                        name="hourglass-empty"
                        size={24}
                        color="#9BD13D"
                      />
                      <Text style={styles.loadingText}>Carregando...</Text>
                    </View>
                  )}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn("WebView error: ", nativeEvent);
                  }}
                />
              </View>

              {/* Botão de aceitar */}
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={isLoading ? "hourglass-empty" : "check-circle"}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>
                  {isLoading ? "Processando..." : "Aceitar e Continuar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: 70,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: "#9BD13D",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  termsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  webViewContainer: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    minHeight: 300,
  },
  webView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9BD13D",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
  },
});
