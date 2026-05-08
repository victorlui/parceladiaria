import { RenewListProps } from "@/interfaces/renew";
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
import InfoConfirm from "./info-confirm";
import { useAuthStore } from "@/store/auth";
import ButtonModal from "./button-modal";
import ChangeKey from "./change-key";
import { changePixKey } from "@/services/change-pix";
import { useAlerts } from "../useAlert";

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  selectedItem: RenewListProps;
}

const ModalConfirm: React.FC<Props> = ({
  visible,
  onConfirm,
  onCancel,
  selectedItem,
}) => {
  const { user, setUser } = useAuthStore();
  const { showWarning, AlertDisplay } = useAlerts();
  const [step, setStep] = useState<"confirm" | "change-key">("confirm");
  const [loading, setLoading] = useState(false);

  const handleChangeKey = async (newKey: string, type: string) => {
    setLoading(true);
    try {
      await changePixKey(newKey, type);

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setUser({
          ...currentUser,
          pix: newKey,
        });
      }

      setStep("confirm");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Chave pertence a outro titular";

      showWarning("Atenção", message);
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
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AlertDisplay />
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
              <Header
                title={
                  step === "confirm"
                    ? "Confirmar Chave PIX"
                    : "Alterar Chave PIX"
                }
                onClose={() => {
                  setStep("confirm");
                  onCancel();
                }}
              />
              {step === "confirm" && (
                <>
                  <InfoConfirm
                    valueSelected={String(selectedItem?.loan_value ?? "")}
                    valueToReceive={String(selectedItem?.to_receive ?? "")}
                  />
                  <Text
                    className="mt-4 text-center"
                    style={{ fontSize: 14, color: "#6B7280", lineHeight: 23 }}
                  >
                    O valor será enviado para a sua chave PIX cadastrada abaixo:
                  </Text>
                  <View className="mt-3 border border-gray-200 rounded-xl px-4 py-3">
                    <Text className="text-gray-900 font-semibold text-center">
                      {user?.pix?.replace(/[^\w\s]/gi, "") || ""}
                    </Text>
                  </View>

                  <Text className="text-center text-gray-700 mt-5">
                    Esta chave está correta?
                  </Text>
                  <ButtonModal
                    textButton1="Alterar Chave"
                    textButton2="Sim, está correto"
                    onConfirm={() => onConfirm()}
                    handleChangePress={() => setStep("change-key")}
                    loading={loading}
                  />
                </>
              )}

              {step === "change-key" && (
                <ChangeKey
                  onSave={handleChangeKey}
                  onStepChange={setStep}
                  isLoading={loading}
                />
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalConfirm;
