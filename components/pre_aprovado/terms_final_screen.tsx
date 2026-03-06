import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import { File, Paths } from "expo-file-system";
import { Buffer } from "buffer";
import Pdf from "react-native-pdf";
import ButtonComponent from "../ui/Button";
import api from "@/services/api";
global.Buffer = Buffer;

type Props = {
  loadingAccept: boolean;
  onAccept: () => void;
};

const TermsFinalScreen: React.FC<Props> = ({ loadingAccept, onAccept }) => {
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const getTerms = async () => {
    try {
      const response = await api.post(
        "v1/contract/preview",
        { valor: "600" },
        {
          responseType: "arraybuffer",
        },
      );

      const base64 = Buffer.from(response.data).toString("base64");

      const file = new File(Paths.cache, "contrato.pdf");

      file.write(base64, {
        encoding: "base64",
      });

      setPdfUri(file.uri);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Ocorreu um erro ao carregar o contrato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTerms();
  }, []);

  if (loading || !pdfUri) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.green.primary} />
        <Text style={styles.subtitle}>Carregando contrato...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Pdf
          source={{ uri: pdfUri }}
          style={{ flex: 1 }}
          fitPolicy={0} // 🔥 Ajusta largura automaticamente
          enablePaging={false}
          horizontal={false}
          enableAntialiasing
          trustAllCerts={false}
          onLoadComplete={(numberOfPages) => {
            console.log("Total de páginas:", numberOfPages);
          }}
          onError={(error) => {
            console.log(error);
          }}
        />
      </View>

      <ButtonComponent
        title="Aceitar e Continuar"
        onPress={onAccept}
        disabled={loadingAccept}
        loading={loadingAccept}
        iconLeft={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: "center",
  },
});

export default TermsFinalScreen;
