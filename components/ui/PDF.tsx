import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";

type Props = {
  uri: string;
};

const PDFViewer: React.FC<Props> = ({ uri }) => {
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64", // CORRETO PARA SDK NOVO
        });

        setBase64Pdf(base64);
      } catch (err) {
        console.log("Erro ao carregar PDF:", err);
        setError("Não foi possível carregar o PDF.");
      }
    })();
  }, [uri]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!base64Pdf) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando PDF...</Text>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={["*"]}
      style={{ flex: 1 }}
      javaScriptEnabled
      domStorageEnabled
      source={{
        html: `
          <html>
            <body style="margin:0;padding:0;">
              <embed 
                width="100%" 
                height="100%" 
                type="application/pdf"
                src="data:application/pdf;base64,${base64Pdf}"
              />
            </body>
          </html>
        `,
      }}
    />
  );
};

export default PDFViewer;
