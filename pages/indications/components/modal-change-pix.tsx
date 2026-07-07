import ButtonModal from "@/components/renew/button-modal";
import PixKeySelect from "@/components/renew/PixKeySelect";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { api } from "@/services/api";
import { validateEmail, validatePhone } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onChangePixKey: (key: string) => void;
};
const ModalChangepix: React.FC<Props> = ({
  visible,
  onClose,
  onChangePixKey,
}) => {
  const { showError, showSuccess, AlertDisplay } = useAlerts();
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const [type, setType] = useState<any>("cpf");
  const [keyNew, setKeyNew] = useState("");
  const [loading, setLoading] = useState(false);

  const onChangeKey = (text: string) => {
    setKeyNew(text);
  };

  const onConfirm = async () => {
    if (!keyNew) {
      return showError("Atenção", "Chave Pix não pode estar vazia");
    }

    if (type === "email" && validateEmail(keyNew)) {
      return showError("Atenção", "E-mail inválido");
    }
    if (type === "phone" && validatePhone(keyNew)) {
      return showError("Atenção", "Telefone inválido");
    }

    try {
      setLoading(true);
      await api.get("/v1/search/dict", {
        params: {
          pixKey: keyNew,
          type: type === "random" ? "evp" : type,
        },
      });

      onChangePixKey(keyNew);
      showSuccess("Sucesso", "Chave Pix alterada com sucesso", () => {
        onClose();
      });
    } catch (error: any) {
      showError(
        "Atenção",
        error.response?.data?.error || "Erro ao alterar chave Pix",
      );
      onClose();
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
    >
      <AlertDisplay />
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <View style={styles.closeRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.gray.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Alterar chave</Text>

          <View style={styles.formContent}>
            <Text style={styles.label}>Tipo de chave</Text>
            <PixKeySelect
              value={type}
              onChange={(value) => {
                setType(value);
                setKeyNew("");
              }}
            />

            <Text style={styles.label}>Nova chave</Text>

            <TextInput
              placeholder="Digite a nova chave"
              style={styles.input}
              placeholderTextColor="#64748B"
              onChangeText={(text) => onChangeKey(text)}
              value={keyNew}
              autoCapitalize="none"
            />

            <ButtonModal
              textButton1="Cancelar"
              textButton2="Salvar e Continuar"
              onConfirm={onConfirm}
              handleChangePress={() => {
                onClose();
              }}
              loading={loading}
            />
          </View>
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
      gap: 8,
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
    formContent: {
      marginTop: 12,
      gap: 12,
    },
    label: {
      color: "#334155",
      fontSize: isSmallDevice ? 13 : 14,
      lineHeight: isSmallDevice ? 20 : 22,
      fontWeight: "600",
    },
    input: {
      borderWidth: 1,
      borderColor: Colors.borderColor,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: isSmallDevice ? 13 : 14,
      color: "#0F172A",
      marginBottom: 8,
    },
  });
};

export default ModalChangepix;
