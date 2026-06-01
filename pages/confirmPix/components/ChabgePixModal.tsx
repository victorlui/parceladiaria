import ModalOtp from "@/components/renew/modal-otp";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPixKeyValidationError } from "../utils/validation";

interface PixModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (type: string, key: string) => void;
}

type PixKeyType = "cpf" | "email" | "phone" | "evp";

type PixTypeOption = {
  id: PixKeyType;
  label: string;
  icon: string;
};

const PIX_TYPES: PixTypeOption[] = [
  { id: "cpf", label: "CPF", icon: "person-outline" },
  { id: "email", label: "E-mail", icon: "mail-outline" },
  { id: "phone", label: "Telefone", icon: "call-outline" },
  { id: "evp", label: "Aleatória", icon: "shuffle-outline" },
];

export const ChangePixModal: React.FC<PixModalProps> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const { showWarning, AlertDisplay } = useAlerts();
  const [selectedType, setSelectedType] = useState<PixKeyType>("cpf");
  const [keyValue, setKeyValue] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<{
    data: { phone: string };
    message: string;
  } | null>(null);

  const selectedTypeLabel =
    PIX_TYPES.find((t) => t.id === selectedType)?.label ?? selectedType;

  const validationError = getPixKeyValidationError(selectedType, keyValue);
  const isValid = !validationError;

  // Monitora a altura do teclado em tempo real
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSave = async () => {
    setTouched(true);
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      console.log("keyValue", keyValue.trim());
      console.log("selectedType", selectedType);
      const { data: response } = await api.post("/v1/client/change/pix/otp", {
        pix: keyValue.trim(),
        type: selectedType,
      });
      setData(response);
      setModalVisible(true);
      setTouched(false);
      onClose();
    } catch (error: any) {
      console.log("erro ao mudar o pix", error.response);
      showWarning(
        "Atenção",
        error.response.data.message || "Erro ao enviar OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  if (modalVisible) {
    return (
      <ModalOtp
        data={data}
        visible
        onCancel={() => setModalVisible(false)}
        onSave={() => {
          onSave(selectedType, keyValue.trim());
          setModalVisible(false);
        }}
      />
    );
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <AlertDisplay />
      <View style={styles.overlay}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <View style={styles.dismissArea} />
        </TouchableWithoutFeedback>

        {/* O segredo: Padding inferior dinâmico igual à altura do teclado */}
        <View
          style={[
            styles.sheet,
            {
              paddingBottom:
                keyboardHeight > 0 ? keyboardHeight + 10 : insets.bottom + 20,
            },
          ]}
        >
          <View style={styles.indicator} />

          <View style={styles.header}>
            <Text style={styles.title}>Alterar Chave PIX</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text style={styles.subtitle}>Escolha o tipo de chave:</Text>

            <View style={styles.typeGrid}>
              {PIX_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedType(type.id);
                    setKeyValue("");
                    setTouched(false);
                  }}
                  disabled={loading}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={20}
                    color={
                      selectedType === type.id ? Colors.green.button : "#64748B"
                    }
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type.id && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Digite a chave {selectedTypeLabel}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={`Insira sua chave ${selectedTypeLabel.toLowerCase()}`}
                value={keyValue}
                onChangeText={(text) => setKeyValue(text)}
                autoFocus
                editable={!loading}
                keyboardType={
                  selectedType === "cpf"
                    ? "number-pad"
                    : selectedType === "phone"
                      ? "phone-pad"
                      : "default"
                }
                autoCapitalize="none"
                onSubmitEditing={Keyboard.dismiss}
                returnKeyType="done"
                placeholderTextColor={Colors.gray.text}
              />
              {touched && validationError ? (
                <Text style={styles.errorText}>{validationError}</Text>
              ) : null}
            </View>

            {/* Botão Salvar dentro do ScrollView para garantir que ele suba */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                (!isValid || loading) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!isValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Confirmar Nova Chave</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    // Limitamos a altura para não sumir da tela no Android
    maxHeight: "85%",
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "600",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 24,
  },
  typeButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    gap: 8,
  },
  typeButtonActive: {
    borderColor: Colors.green.button,
    backgroundColor: "#F0FDF4",
  },
  typeLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  typeLabelActive: {
    color: Colors.green.button,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F1F5F9",
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1E293B",
  },
  errorText: {
    marginTop: 8,
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: Colors.green.button,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  saveBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
