import ChangeKey from "@/components/renew/change-key";
import LoadingDots from "@/components/ui/LoadingDots";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { api } from "@/services/api";
import { changePixKey } from "@/services/change-pix";
import { formatCurrencyBRL } from "@/utils/formats";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { IndicationResponse } from "../types/indications";

interface Props {
  visible: boolean;
  onClose: () => void;
  indications: IndicationResponse | null;
  onChangePixKey: (key: string) => void;
  onSuccess: (status: string, valorSacado: number) => void;
}

const ModalConfirm: React.FC<Props> = (props) => {
  const { visible, onClose, indications, onChangePixKey, onSuccess } = props;
  const { showError, AlertDisplay } = useAlerts();
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const [step, setStep] = useState<"confirm" | "change-key">("confirm");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const handleChangeKey = async (newKey: string, type: string) => {
    setLoading(true);
    try {
      await changePixKey(newKey, type);
      onChangePixKey(newKey);
      setStep("confirm");
    } catch (error: any) {
      showError(
        "Atenção",
        error.response?.data?.error || "Erro ao alterar chave Pix",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/v1/affiliate/withdraw");

      if (data.success && data.data) {
        onSuccess(data.data.status, data.data.valor_sacado);
      }
      onClose();
    } catch (error: any) {
      showError("Error", error.response?.data?.message || error.message);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={() => {
        setStep("confirm");
        onClose();
      }}
    >
      <AlertDisplay />
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          onPress={() => {}}
          style={[
            styles.modalCard,
            step === "change-key" && styles.modalCardExpanded,
          ]}
        >
          <View style={styles.closeRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={handleClose}>
              <Ionicons name="close" size={20} color={Colors.gray.primary} />
            </TouchableOpacity>
          </View>

          {step === "confirm" && (
            <>
              <Text style={styles.title}>Confirmar saque</Text>
              <Text style={styles.amount}>
                R$ {formatCurrencyBRL(indications?.data?.saldo)}
              </Text>

              <View style={styles.pixCard}>
                <View style={styles.pixRow}>
                  <View style={styles.pixContent}>
                    <Text style={styles.pixLabel}>Chave PIX de destino</Text>
                    <Text style={styles.pixValue} numberOfLines={1}>
                      {indications?.data?.pix_key}
                    </Text>
                  </View>
                  <FontAwesome6
                    name="pix"
                    size={20}
                    color={Colors.green.text}
                  />
                </View>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    loading && styles.buttonDisabledOpacity,
                  ]}
                  disabled={loading}
                  onPress={confirm}
                >
                  {loading ? (
                    <LoadingDots text="Confirmando..." />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Confirmar</Text>
                      <Ionicons
                        name="arrow-forward-outline"
                        size={20}
                        color={Colors.white}
                      />
                    </>
                  )}
                </Pressable>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    loading && styles.buttonDisabledOpacity,
                  ]}
                  onPress={() => setStep("change-key")}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>Alterar chave</Text>
                </Pressable>
              </View>
            </>
          )}

          {step === "change-key" && (
            <View style={styles.changeKeyContainer}>
              <Text style={styles.title}>Alterar chave</Text>
              <ChangeKey
                onSave={handleChangeKey}
                onStepChange={setStep}
                isLoading={loading}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    modalCard: {
      width: "100%",
      maxWidth: 420,
      borderRadius: isSmallDevice ? 20 : 24,
      backgroundColor: Colors.white,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 24,
      paddingVertical: isSmallDevice ? 18 : 20,
      gap: 20,
    },
    modalCardExpanded: {
      minHeight: 400,
    },
    closeRow: {
      alignItems: "flex-end",
    },
    title: {
      textAlign: "center",
      color: "#233047",
      fontSize: isSmallDevice ? 18 : isMediumDevice ? 20 : 22,
      lineHeight: isSmallDevice ? 26 : isMediumDevice ? 28 : 30,
      fontWeight: "700",
    },
    amount: {
      textAlign: "center",
      color: "#0F172A",
      fontSize: isSmallDevice ? 26 : isMediumDevice ? 30 : 32,
      lineHeight: isSmallDevice ? 34 : isMediumDevice ? 38 : 40,
      fontWeight: "700",
      marginVertical: 4,
    },
    pixCard: {
      borderWidth: 1,
      borderColor: "#D1D5DB",
      borderRadius: 16,
      paddingHorizontal: isSmallDevice ? 14 : 16,
      paddingVertical: isSmallDevice ? 14 : 16,
    },
    pixRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    pixContent: {
      flex: 1,
      gap: 6,
    },
    pixLabel: {
      color: "#64748B",
      fontSize: isSmallDevice ? 11 : 12,
      lineHeight: isSmallDevice ? 18 : 20,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    pixValue: {
      color: "#0F172A",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 26 : 28,
      fontWeight: "700",
    },
    actions: {
      gap: 12,
      marginTop: 4,
    },
    primaryButton: {
      minHeight: 52,
      borderRadius: 999,
      backgroundColor: Colors.green.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 18,
    },
    primaryButtonText: {
      color: Colors.white,
      fontSize: isSmallDevice ? 16 : 17,
      lineHeight: isSmallDevice ? 24 : 26,
      fontWeight: "700",
    },
    secondaryButton: {
      minHeight: 52,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#D1D5DB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
    },
    secondaryButtonText: {
      color: "#233047",
      fontSize: isSmallDevice ? 16 : 17,
      lineHeight: isSmallDevice ? 24 : 26,
      fontWeight: "700",
    },
    buttonDisabledOpacity: {
      opacity: 0.5,
    },
    changeKeyContainer: {
      flex: 1,
      gap: 12,
    },
  });
};

export default ModalConfirm;
