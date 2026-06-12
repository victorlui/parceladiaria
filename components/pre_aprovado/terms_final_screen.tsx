import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Buffer } from "buffer";
import { File, Paths } from "expo-file-system";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import Pdf from "react-native-pdf";
import ButtonComponent from "../ui/Button";
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
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={28}
            color={Colors.primaryColor}
          />
        </View>
        <Text style={styles.title}>Contrato de Adesão</Text>
        <Text style={styles.description}>
          Por favor, leia atentamente o documento abaixo. Ao aceitar, você
          concorda com todas as condições estabelecidas.
        </Text>
      </View>

      <View style={styles.pdfContainer}>
        <Pdf
          source={{ uri: pdfUri }}
          style={styles.pdf}
          fitPolicy={0} // 🔥 Ajusta largura automaticamente
          enablePaging={false}
          horizontal={false}
          enableAntialiasing
          trustAllCerts={false}
          onLoadComplete={(numberOfPages) => {
            return numberOfPages;
          }}
          onError={(error) => {
            Alert.alert("Erro", "Ocorreu um erro ao carregar o contrato.");
          }}
        />
      </View>

      <View style={styles.footer}>
        <ButtonComponent
          title="Li e aceito os termos"
          onPress={onAccept}
          disabled={loadingAccept}
          loading={loadingAccept}
          iconLeft={null}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.info.bg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primaryColor,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: Colors.gray.text,
    lineHeight: 20,
    textAlign: "center",
  },
  pdfContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    minHeight: 400, // Garantir uma altura mínima
  },
  pdf: {
    flex: 1,
    backgroundColor: "transparent",
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: "center",
  },
});

export default TermsFinalScreen;
