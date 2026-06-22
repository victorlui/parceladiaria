import { ANALYTICS_FLOWS } from "@/analytics/events";
import { useModalTracking } from "@/analytics/hooks/useModalTracking";
import { Colors } from "@/constants/Colors";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Network from "expo-network";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { AcordoResponse } from "../types/acordo";

interface AcordoModalProps {
  visible: boolean;
  onClose: () => void;
  onFirmado?: () => void;
  acordo: AcordoResponse | null;
}

type AgreementPayment = {
  qrCode?: string;
  base64QrCode?: string;
  txId?: string;
  emv?: string;
  copia_cola?: string;
  imagem?: string;
  base64?: string;
};

type AcceptAgreementResponse = {
  success: boolean;
  message: string;
  data?: {
    firmado: boolean;
    aceite: string;
    entrada_valor?: number;
    payment?: AgreementPayment;
  };
};

type AgreementStatusResponse = {
  success: boolean;
  message: string;
  data?: AcordoResponse["data"];
};

const AcordoModal = ({
  visible,
  onClose,
  onFirmado,
  acordo,
}: AcordoModalProps) => {
  useModalTracking({
    modalName: "Acordo Modal",
    isVisible: visible,
    properties: {
      flow: ANALYTICS_FLOWS.ACORDO,
      screen: "Home",
      modal_type: "bottom_sheet",
      modal_context: "acordo",
    },
  });

  const acordoData = acordo?.data;
  const { user } = useAuthStore.getState();
  const [termoHtml, setTermoHtml] = useState("");
  const [termoVisible, setTermoVisible] = useState(false);
  const [termoLoading, setTermoLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [termoError, setTermoError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pixVisible, setPixVisible] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [pixQrImage, setPixQrImage] = useState("");
  const [pixAmount, setPixAmount] = useState(0);
  const [copyingPix, setCopyingPix] = useState(false);
  const [savedPixAgreementId, setSavedPixAgreementId] = useState<number | null>(
    null,
  );
  const [acceptedAt, setAcceptedAt] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);

  useEffect(() => {
    async function getTermos() {
      if (!visible || !acordoData?.id) {
        return;
      }

      try {
        setTermoLoading(true);
        setTermoError("");
        const { data } = await api.get(`/v1/agreement/${acordoData?.id}/termo`);
        setTermoHtml(data?.data?.html ?? "");
      } catch (error: any) {
        setTermoError("Nao foi possivel carregar o termo.");
      } finally {
        setTermoLoading(false);
      }
    }

    getTermos();
  }, [visible, acordoData?.id]);

  useEffect(() => {
    if (!visible) {
      setAccepted(false);
      setTermoVisible(false);
      setSubmitError("");
    }
  }, [visible]);

  const cronograma = acordoData?.cronograma ?? [];
  const parcelas = cronograma.filter(
    (item) => item.rotulo.toLowerCase() !== "entrada",
  );
  const totalAcordo = cronograma.reduce(
    (acc, item) => acc + Number(item.valor || 0),
    0,
  );
  const frequenciaLabel =
    acordoData?.frequencia === "semanal"
      ? "semanais"
      : `${acordoData?.frequencia || ""}s`;
  const normalizedTermoHtml = useMemo(() => {
    const sanitizedHtml = termoHtml
      .replace(/`/g, "")
      .replace(
        /<head>/i,
        `<head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />`,
      );

    return sanitizedHtml.replace(
      /<\/head>/i,
      `
        <style>
          html, body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-text-size-adjust: 100%;
          }

          img, table, div {
            max-width: 100% !important;
          }
        </style>
      </head>`,
    );
  }, [termoHtml]);

  const hasSavedPixData =
    savedPixAgreementId === acordoData?.id && Boolean(pixCode || pixQrImage);

  useEffect(() => {
    if (visible && hasSavedPixData && !pixVisible) {
      setPixVisible(true);
      onClose();
    }
  }, [visible, hasSavedPixData, pixVisible, onClose]);

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatAcceptedAt = (value: string) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const clearSavedPixData = () => {
    setPixCode("");
    setPixQrImage("");
    setPixAmount(0);
    setCopyingPix(false);
    setSavedPixAgreementId(null);
    setAcceptedAt("");
  };

  const closePixModal = () => {
    setPixVisible(false);
    setCopyingPix(false);
  };

  const handleCloseAgreementModal = async () => {
    onClose();
  };

  const closeAllModals = async () => {
    closePixModal();
    onClose();
  };

  const closeSuccessModal = async () => {
    setSuccessVisible(false);
    onClose();
  };

  const closeModalFirmado = async () => {
    setSuccessVisible(false);
    onClose();
    onFirmado?.();
  };

  const copyPixCode = async () => {
    if (!pixCode) {
      return;
    }

    try {
      await Clipboard.setStringAsync(pixCode);
      setCopyingPix(true);
    } catch {
      Alert.alert("Erro", "Nao foi possivel copiar o codigo Pix.");
    }
  };

  async function onSubmit() {
    if (!accepted || submitLoading) {
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError("");
      const ip = await Network.getIpAddressAsync();
      const request = {
        id: acordoData?.id,
        sign_info_ip_address: ip,
        sign_info_city: user?.cidade || "",
        sign_info_state: user?.estado || "",
        sign_info_country: "BR",
      };

      const { data } = await api.post<AcceptAgreementResponse>(
        `/v1/agreement/accept`,
        request,
      );

      if (!data?.success) {
        setSubmitError(data?.message || "Nao foi possivel registrar o aceite.");
        return;
      }

      const payment = data.data?.payment;
      const rawPixCode =
        payment?.qrCode || payment?.emv || payment?.copia_cola || "";
      const rawPixImage =
        payment?.base64QrCode || payment?.imagem || payment?.base64 || "";
      const formattedPixImage = rawPixImage.startsWith("data:image")
        ? rawPixImage
        : rawPixImage
          ? `data:image/png;base64,${rawPixImage}`
          : "";

      if (data.data?.firmado) {
        clearSavedPixData();
        setAcceptedAt(data.data?.aceite || "");
        setSuccessVisible(true);
        closePixModal();
        onClose();
        return;
      }

      if (rawPixCode || formattedPixImage) {
        setPixCode(rawPixCode);
        setPixQrImage(formattedPixImage);
        setPixAmount(
          Number(data.data?.entrada_valor || acordoData?.entrada_valor || 0),
        );
        setSavedPixAgreementId(acordoData?.id ?? null);
        setAcceptedAt(data.data?.aceite || "");
        setPixVisible(true);
        return;
      }

      Alert.alert("Aviso", data.message || "Aceite registrado com sucesso.");
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        (status === 403
          ? "Nao foi possivel validar o aceite deste acordo."
          : status === 404
            ? "Acordo nao encontrado."
            : status === 410
              ? "A oferta expirou. Gere um novo acordo."
              : status === 500
                ? "Erro ao processar o acordo. Tente novamente."
                : "Nao foi possivel concluir o aceite agora.");
      setSubmitError(message);
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
    if (!pixVisible || !savedPixAgreementId) {
      return;
    }

    let isMounted = true;

    const checkAgreementStatus = async () => {
      try {
        const { data } = await api.get<AgreementStatusResponse>(
          `/v1/agreement/${savedPixAgreementId}`,
        );

        if (!isMounted || !data?.success) {
          return;
        }

        const currentStatus = data.data?.status;

        if (currentStatus === "firmado") {
          clearSavedPixData();
          closePixModal();
          onClose();
          setSuccessVisible(true);
          return;
        }

        if (currentStatus === "anulado") {
          clearSavedPixData();
          closePixModal();
          onClose();
          Alert.alert("Acordo cancelado", "Este acordo foi anulado.");
        }
      } catch (error: any) {
        if (!isMounted) {
          return;
        }

        const status = error?.response?.status;

        if (status === 404 || status === 403) {
          clearSavedPixData();
          closePixModal();
          onClose();
          Alert.alert(
            "Acordo indisponivel",
            error?.response?.data?.message ||
              "Nao foi possivel consultar o acordo.",
          );
        }
      }
    };

    checkAgreementStatus();
    const intervalId = setInterval(checkAgreementStatus, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [pixVisible, savedPixAgreementId, onClose]);

  if (!acordoData) {
    return null;
  }

  const paddingSafeAreView: string[] =
    Platform.OS === "ios" ? ["top", "bottom"] : ["top", "bottom"];

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible && !hasSavedPixData}
        onRequestClose={handleCloseAgreementModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.handle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Acordo liberado pra voce - valido so hoje!
                </Text>
              </View>

              <Text style={styles.modalTitle}>
                Preparamos um acordo pra voce ficar em dia
              </Text>

              <Text style={styles.modalText}>
                Reorganizamos o pagamento do seu contrato em condicoes mais
                leves.{" "}
                <Text style={styles.modalTextStrong}>
                  A oferta vale so por hoje
                </Text>{" "}
                - aceite e pague a entrada pra garantir.
              </Text>

              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Total do acordo</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(totalAcordo)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.summaryText}>
                  <Text style={styles.summaryStrong}>Entrada</Text> de{" "}
                  {formatCurrency(acordoData.entrada_valor)} +{" "}
                  <Text style={styles.summaryStrong}>
                    {parcelas.length} pagamento{parcelas.length > 1 ? "s" : ""}{" "}
                    {frequenciaLabel}
                  </Text>
                  .
                </Text>

                <Text style={styles.summaryText}>
                  Primeiro vencimento em{" "}
                  <Text style={styles.summaryStrong}>
                    {acordoData.venc_primeiro}
                  </Text>
                  .
                </Text>
              </View>

              <Text style={styles.sectionTitle}>COMO FICA O PAGAMENTO</Text>

              <View style={styles.table}>
                {cronograma.map((item, index) => {
                  const isEntrada = item.rotulo.toLowerCase() === "entrada";

                  return (
                    <View
                      key={`${item.rotulo}-${item.vencimento}-${index}`}
                      style={[
                        styles.tableRow,
                        index === cronograma.length - 1 && styles.tableRowLast,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tableCellLabel,
                          isEntrada && styles.tableCellHighlight,
                        ]}
                      >
                        {item.rotulo}
                      </Text>
                      <Text style={styles.tableCellDate}>
                        {item.vencimento}
                      </Text>
                      <Text
                        style={[
                          styles.tableCellValue,
                          isEntrada && styles.tableCellHighlight,
                        ]}
                      >
                        {formatCurrency(item.valor)}
                      </Text>
                    </View>
                  );
                })}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(totalAcordo)}
                  </Text>
                </View>
              </View>

              <View style={styles.checkboxCard}>
                <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: accepted }}
                    activeOpacity={0.8}
                    hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                    onPress={() => setAccepted((current) => !current)}
                    style={[
                      styles.checkbox,
                      accepted && styles.checkboxChecked,
                    ]}
                  >
                    {accepted ? (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    ) : null}
                  </TouchableOpacity>

                  <Text style={styles.checkboxText}>
                    Li e concordo com as condicoes do acordo. Entendo que
                    cumprir todas as parcelas quita meu saldo, e que o nao
                    pagamento cancela o acordo.{" "}
                    <Text
                      style={styles.termLink}
                      onPress={() => setTermoVisible(true)}
                    >
                      Ver termo completo
                    </Text>
                  </Text>
                </View>

                {termoError ? (
                  <Text style={styles.termErrorText}>{termoError}</Text>
                ) : null}
                {submitError ? (
                  <Text style={styles.termErrorText}>{submitError}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!accepted || submitLoading) && styles.payButtonDisabled,
                ]}
                activeOpacity={accepted && !submitLoading ? 0.85 : 1}
                disabled={!accepted || submitLoading}
                onPress={onSubmit}
              >
                <Text style={styles.payButtonText}>
                  {submitLoading ? "Processando..." : "Aceitar acordo"}
                </Text>
              </TouchableOpacity>

              {!submitLoading && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseAgreementModal}
                  activeOpacity={0.85}
                  disabled={submitLoading}
                >
                  <Text style={styles.closeButtonText}>Agora nao</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={termoVisible}
        animationType="slide"
        onRequestClose={() => setTermoVisible(false)}
      >
        <SafeAreaView style={styles.termsContainer} edges={["top", "bottom"]}>
          <View style={styles.termsContent}>
            {termoLoading ? (
              <View style={styles.termsLoadingBox}>
                <ActivityIndicator size="small" color="#2457C6" />
                <Text style={styles.termsLoadingText}>Carregando termo...</Text>
              </View>
            ) : normalizedTermoHtml ? (
              <WebView
                originWhitelist={["*"]}
                source={{ html: normalizedTermoHtml }}
                style={styles.webview}
                startInLoadingState={true}
                showsVerticalScrollIndicator={true}
                scalesPageToFit={true}
              />
            ) : (
              <View style={styles.termsLoadingBox}>
                <Text style={styles.termsLoadingText}>
                  Termo indisponivel no momento.
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setTermoVisible(false)}
              style={styles.termsFloatingCloseButton}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={22} color="#334155" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={successVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.centeredView}>
          <SafeAreaView
            style={styles.successSafeArea}
            edges={paddingSafeAreView as any}
          >
            <View style={styles.successModalView}>
              <View style={styles.handle} />

              <View style={styles.sucessContainer}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark" size={38} color="#15845F" />
                </View>
              </View>

              <Text style={styles.successTitle}>Acordo firmado!</Text>
              <Text style={styles.successDescription}>
                Entrada confirmada e seu novo cronograma ja esta valendo.
              </Text>

              <View style={styles.successInfoCard}>
                <Text style={styles.successInfoText}>
                  Aceite via aplicativo em {formatAcceptedAt(acceptedAt)}
                </Text>
                <Text style={styles.successInfoText}>
                  Entrada paga e acordo firmado
                </Text>
              </View>

              <Text style={styles.successFooterText}>
                O documento do acordo ja esta disponivel.
              </Text>

              <TouchableOpacity
                style={styles.successCloseButton}
                onPress={closeModalFirmado}
                activeOpacity={0.85}
              >
                <Text style={styles.successCloseButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        visible={pixVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={closeAllModals}
      >
        <SafeAreaView
          style={styles.pixSafeArea}
          edges={paddingSafeAreView as any}
        >
          <View style={styles.pixModalView}>
            <TouchableOpacity
              onPress={closeAllModals}
              style={styles.termsFloatingCloseButton}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={22} color="#334155" />
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pixScrollContent}
            >
              <View style={styles.handle} />

              <Text style={styles.pixTitle}>
                Pague a entrada pra firmar o acordo
              </Text>

              <View style={styles.pixWarningBox}>
                <Text style={styles.pixWarningText}>
                  O acordo so e firmado depois que a entrada for paga. Enquanto
                  isso, ele fica reservado pra voce.
                </Text>
              </View>

              <Text style={styles.pixAmountLabel}>Valor da entrada</Text>
              <Text style={styles.pixAmountValue}>
                {formatCurrency(pixAmount)}
              </Text>

              <View style={styles.pixQrWrapper}>
                {pixQrImage ? (
                  <Image
                    source={{ uri: pixQrImage }}
                    style={styles.pixQrImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.pixUnavailableText}>
                    QR Code indisponivel.
                  </Text>
                )}
              </View>

              <View style={styles.pixCopyContainer}>
                <Text style={styles.pixCodeText}>{pixCode}</Text>
                <TouchableOpacity
                  style={styles.pixCopyButton}
                  onPress={copyPixCode}
                  activeOpacity={0.85}
                >
                  <Text style={styles.pixCopyButtonText}>
                    {copyingPix ? "Copiado" : "Copiar"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.pixFooterText}>
                Assim que o pagamento cair, seu acordo e firmado
                automaticamente.
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeAllModals}
                activeOpacity={0.85}
              >
                <Text style={styles.closeButtonText}>Pago mais tarde</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "100%",
    maxHeight: "94%",
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    alignSelf: "center",
    width: 52,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D2D8E2",
    marginBottom: 22,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FDEBDF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 22,
  },
  badgeText: {
    color: "#C8691E",
    fontSize: 14,
    fontWeight: "700",
  },
  modalTitle: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "700",
    color: "#26365A",
    marginBottom: 14,
  },
  modalText: {
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 31,
    color: "#6B7488",
  },
  modalTextStrong: {
    fontWeight: "700",
    color: "#5E667B",
  },
  summaryCard: {
    backgroundColor: "#F2F5FA",
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6E778B",
  },
  summaryValue: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    color: "#2457C6",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#DCE3EF",
    borderStyle: "dashed",
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 28,
    color: "#6E778B",
  },
  summaryStrong: {
    color: "#22345C",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6A7284",
    marginBottom: 16,
    letterSpacing: 0.4,
  },
  table: {
    marginBottom: 18,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#D8DEE8",
  },
  tableRowLast: {
    borderBottomWidth: 1,
  },
  tableCellLabel: {
    flex: 1.2,
    fontSize: 15,
    color: "#6A7284",
  },
  tableCellDate: {
    flex: 1,
    fontSize: 15,
    color: "#6A7284",
    textAlign: "center",
  },
  tableCellValue: {
    flex: 0.8,
    fontSize: 15,
    color: "#22345C",
    fontWeight: "700",
    textAlign: "right",
  },
  tableCellHighlight: {
    color: "#0E8A5A",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#D8DEE8",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#22345C",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#22345C",
  },
  checkboxCard: {
    borderWidth: 1,
    borderColor: "#D8DEE8",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#FAFBFD",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    marginTop: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.green.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: Colors.green.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 28,
    color: "#6A7284",
  },
  termLink: {
    color: Colors.green.primary,
    textDecorationLine: "underline",
  },
  termErrorText: {
    marginTop: 10,
    fontSize: 13,
    color: "#B45309",
  },
  payButton: {
    backgroundColor: Colors.green.button,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 6,
  },
  payButtonDisabled: {
    backgroundColor: "#C6D0DE",
  },
  payButtonText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 17,
  },
  closeButton: {
    paddingHorizontal: 24,
    marginTop: 8,
    alignItems: "center",
    paddingBottom: 46,
    paddingTop: 16,
  },
  closeButtonText: {
    color: "#677083",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 17,
  },
  termsContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  termsContent: {
    flex: 1,
    position: "relative",
  },
  termsLoadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  termsLoadingText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  webview: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  termsFloatingCloseButton: {
    position: "absolute",
    zIndex: 1000,
    top: 12,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  pixSafeArea: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  pixModalView: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 18,
  },
  pixScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  pixTitle: {
    fontSize: 22,
    lineHeight: 32,
    fontWeight: "800",
    color: "#22345C",
    marginBottom: 16,
  },
  pixWarningBox: {
    backgroundColor: "#FFF6E4",
    borderWidth: 1,
    borderColor: "#E8D2A0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  pixWarningText: {
    fontSize: 15,
    lineHeight: 28,
    color: "#A5781E",
  },
  pixAmountLabel: {
    textAlign: "center",
    fontSize: 15,
    color: "#6B7488",
    marginBottom: 8,
  },
  pixAmountValue: {
    textAlign: "center",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#22345C",
    marginBottom: 20,
  },
  pixQrWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    minHeight: 220,
  },
  pixQrImage: {
    width: 230,
    height: 230,
  },
  pixUnavailableText: {
    fontSize: 14,
    color: "#6B7488",
    textAlign: "center",
  },
  pixCopyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F5FA",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 18,
  },
  pixCodeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 22,
    color: "#22345C",
  },
  pixCopyButton: {
    backgroundColor: Colors.green.button,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pixCopyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  pixFooterText: {
    fontSize: 15,
    lineHeight: 28,
    color: "#6B7488",
    textAlign: "center",
    marginBottom: 8,
  },
  successModalView: {
    width: "100%",
  },
  successSafeArea: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 28,
    alignItems: "center",
  },
  sucessContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  successIconCircle: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: "#E7F4EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  successTitle: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
    color: "#22345C",
    marginBottom: 10,
    textAlign: "center",
  },
  successDescription: {
    fontSize: 16,
    lineHeight: 28,
    color: "#6B7488",
    textAlign: "center",
    marginBottom: 22,
  },
  successInfoCard: {
    width: "100%",
    backgroundColor: "#F2F5FA",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  successInfoText: {
    fontSize: 15,
    lineHeight: 26,
    color: "#8A94A8",
    textAlign: "center",
  },
  successFooterText: {
    fontSize: 16,
    lineHeight: 28,
    color: "#6B7488",
    textAlign: "center",
    marginBottom: 28,
  },
  successCloseButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  successCloseButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#677083",
  },
});

export default AcordoModal;
