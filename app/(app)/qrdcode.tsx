import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { useQueryDataClient } from "@/hooks/useQueryClient";
import PulsingImageLoader from "@/pages/register/components/PulsingImageLoader";
import { getPaymentStatus } from "@/services/loans";
import { useQRCodeStore } from "@/store/qrcode";
import { formatCurrency } from "@/utils/formats";
import { Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  GRADIENT_START: "#209c91",
  GRADIENT_END: "#28a999",
  TEXT_LIGHT: "#ffffff",
  TEXT_DARK: "#28a999",
  BADGE_BORDER: "#ffffff",
  BUTTON_BG: "#ffffff",
  BUTTON_TEXT: "#28a999",
  EMOJI_COLOR: "#ffcc66",
  BADGE_COLOR: "#38B77F",
};

const QrCodePayment: React.FC = () => {
  const { isLoading, qrCodeData } = useQRCodeStore();
  const { refetch } = useQueryDataClient();
  const [copying, setCopying] = useState(false);

  const copyQRCode = async () => {
    if (qrCodeData?.payment?.qrCode) {
      try {
        await Clipboard.setStringAsync(qrCodeData.payment.qrCode);
        setCopying(true);
      } catch {
        Alert.alert("Erro", "Não foi possível copiar o código QR.", [
          { text: "OK" },
        ]);
      }
    }
  };

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ids = (qrCodeData as any)?.ids;
  const transactionId = qrCodeData?.payment?.transactionId;
  const txId = qrCodeData?.payment?.txId;

  const paymentId = React.useMemo(() => {
    const idSource = Array.isArray(ids) ? ids[0] : transactionId || txId;
    if (!idSource) return null;
    const idNum = Number(idSource);
    if (!idNum || Number.isNaN(idNum)) return null;
    return idNum;
  }, [ids, transactionId, txId]);

  useEffect(() => {
    if (!paymentId) return;

    const check = async () => {
      try {
        const res: any = await getPaymentStatus(paymentId);
        await refetch();
        const statusText = String(
          res?.status || res?.message || "",
        ).toLowerCase();
        const paid =
          res?.status_code === 200 ||
          statusText.includes("paid") ||
          statusText.includes("concluido") ||
          res?.paid === "Sim";
        if (paid) {
          Alert.alert("Pagamento concluído", "Seu pagamento foi confirmado.", [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/home"),
            },
          ]);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {}
    };

    pollingRef.current = setInterval(check, 5000);
    check();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentId, refetch]);

  if (isLoading) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text="Gerando QR Code para pagamento..."
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isLoading && (
          <View>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <FontAwesome5 name="arrow-left" size={18} color="black" />
              <Text style={styles.title}>Pagamentos</Text>
            </TouchableOpacity>
            <LinearGradient
              colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.container}
            >
              <View style={styles.body}>
                <Text style={styles.bodyText}>Valor total a pagar</Text>
                <Text style={styles.bodyValue}>
                  {formatCurrency(Number(qrCodeData?.total_with_tax))}
                </Text>
                <Text style={[styles.bodyText, styles.bodyTextNoTransform]}>
                  Referente a {qrCodeData?.qty} parcela(s)
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>Escaneie o QR Code </Text>
              <Text style={styles.instructionsSubText}>
                Abra o app do seu banco, escolha a opção PIX e escaneie o código
                abaixo.
              </Text>
              <View style={styles.qrcodeContainer}>
                <QRCode
                  value={qrCodeData?.payment.qrCode}
                  size={200}
                  color={Colors.black}
                  backgroundColor={Colors.white}
                />
              </View>
              <Text style={styles.instructionsSubText}>
                Se preferir, copie o código e cole no app do seu banco.
              </Text>

              <TouchableOpacity
                onPress={copyQRCode}
                style={styles.copyContainer}
                disabled={copying}
              >
                <ScrollView
                  style={styles.copyScroll}
                  showsVerticalScrollIndicator
                >
                  <Text style={styles.copyCode}>
                    {qrCodeData?.payment.qrCode}
                  </Text>
                </ScrollView>

                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={copyQRCode}
                  activeOpacity={0.8}
                  disabled={copying}
                >
                  <MaterialIcons
                    name="content-copy"
                    size={18}
                    color={COLORS.BUTTON_TEXT}
                  />
                  <Text style={styles.copyButtonText}>
                    {copying ? "Copiado" : "Copiar PIX"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={["#fff9e6", "#fff0b3", "#ffecb3"]}
              start={[0, 1]}
              end={[1, 0]}
              style={styles.warning}
            >
              <Entypo
                name="info-with-circle"
                size={20}
                color={Colors.green.primary}
              />
              <Text style={styles.alertaTexto}>
                Aguardando pagamento... A confirmação pode levar alguns minutos.
              </Text>
            </LinearGradient>

            <TouchableOpacity
              style={styles.buttonHome}
              onPress={() => router.replace("/(tabs)/home")}
            >
              <Text style={styles.buttonHomeText}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.TEXT_LIGHT,
  },
  statusContainer: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.568)",
    backgroundColor: "rgba(255, 255, 255, 0.288)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.BADGE_COLOR,
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.BADGE_BORDER,
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: COLORS.BUTTON_BG,
    borderWidth: 1,
    borderColor: COLORS.BUTTON_TEXT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F766E",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  body: {
    marginVertical: 25,
  },
  bodyText: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "bold",
    color: COLORS.TEXT_LIGHT,
    textTransform: "uppercase",
  },
  bodyValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.TEXT_LIGHT,
    marginVertical: 5,
  },
  instructions: {
    marginVertical: 25,
    flexDirection: "column",
    gap: 5,
    backgroundColor: "#F0F7F8",
    padding: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.black,
  },
  instructionsSubText: {
    fontSize: 14,
    color: Colors.gray.text,
  },
  qrcodeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 16,
  },

  // NOVOS ESTILOS
  copyContainer: {
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D6E4E8",
    padding: 12,
  },
  copyScroll: {
    flex: 1,
    maxHeight: 90,
  },
  copyCode: {
    fontSize: 12,
    color: Colors.black,
  },
  copyButton: {
    alignSelf: "stretch",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.BUTTON_BG,
    borderWidth: 1,
    borderColor: COLORS.BUTTON_TEXT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.BUTTON_TEXT,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    backgroundColor: "#fff9e6",
    borderLeftWidth: 5,
    borderColor: "#D97706",
    borderRadius: 12,
  },
  alertaTexto: {
    flex: 1, // Permite que o texto ocupe o espaço restante
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontFamily: "System", // Use a fonte padrão ou uma fonte customizada do Expo
    color: "#5d4037", // Cor do texto (marrom escuro)
    fontSize: 13,
    fontWeight: "bold",
  },
  buttonHome: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.gray.primary,
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  bodyTextNoTransform: {
    textTransform: "none",
  },
  buttonHomeText: {
    color: Colors.black,
    fontWeight: "bold",
  },
});

export default QrCodePayment;
