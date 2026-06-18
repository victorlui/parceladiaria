import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Header } from "./header-modal";
import InputComponent from "../ui/Input";
import ButtonModal from "./button-modal";
import { useAlerts } from "../useAlert";
import { api } from "@/services/api";

interface Props {
  data: { data: { phone: string }; message: string } | null;
  visible: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const ModalOtp: React.FC<Props> = ({ visible, onCancel, data, onSave }) => {
  const { showWarning, showSuccess, AlertDisplay } = useAlerts();
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const confirmOtp = async () => {
    if (!otp) {
      showWarning("Atenção", "Insira o código OTP");
      return;
    }
    setLoading(true);
    try {
      await api.put("/v1/client/change/pix/confirm", {
        otp,
      });
      showSuccess("Validado", "Código OTP válido", () => {
        setOtp("");
        onSave();
      });
    } catch {
      showWarning("Atenção", "Código OTP inválido");
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
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View
              className="bg-white rounded-24 p-6 w-[95%] "
              style={{ borderRadius: 16 }}
            >
              <Header title="Confirmar Código" onClose={onCancel} />

              <Text
                className="text-center"
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 23,
                }}
              >
                {data?.message || ""}
              </Text>

              <View style={{ marginVertical: 15 }}>
                <InputComponent
                  placeholder="Código OTP Enviado"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  returnKeyType="send"
                  autoFocus
                  autoCapitalize="characters"
                  keyboardType="number-pad"
                />
              </View>

              <ButtonModal
                textButton1="Cancelar"
                textButton2="Salvar"
                onConfirm={() => {
                  Keyboard.dismiss();
                  confirmOtp();
                }}
                handleChangePress={onCancel}
                loading={loading}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalOtp;
