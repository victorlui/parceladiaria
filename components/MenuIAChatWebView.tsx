import { useNotificationsStore } from "@/store/notifications";
import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface MenuIAChatWebViewProps {
  widgetId: string;
  title?: string;
  primaryColor?: string;
  theme?: "light" | "dark";
}

const MenuIAChatWebView: React.FC<MenuIAChatWebViewProps> = ({
  widgetId = "75968a3e-7e74-41af-9bd2-453797409da8",
  title = "Suporte",
  primaryColor = "#32e10e",
  theme = "dark",
}) => {
  // A URL do widget do MenuIA geralmente segue este padrão:
  // https://chatbot.menuia.com/widget/{widgetId}
  // Se a URL for diferente, ajuste aqui.

  const widgetUrl = `https://chatbot.menuia.com/widget/${widgetId}?title=${encodeURIComponent(
    title,
  )}&primaryColor=${encodeURIComponent(primaryColor)}&theme=${theme}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: widgetUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 500, // Ajuste a altura conforme necessário
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 10,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default MenuIAChatWebView;
