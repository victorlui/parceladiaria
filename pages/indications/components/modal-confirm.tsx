import ChangeKey from "@/components/renew/change-key";
import LoadingDots from "@/components/ui/LoadingDots";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { changePixKey } from "@/services/change-pix";
import { formatCurrencyBRL } from "@/utils/formats";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
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
  const [step, setStep] = useState<"confirm" | "change-key">("confirm");
  const [loading, setLoading] = useState(false);

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
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center"
        onPress={() => {
          setStep("confirm");
          onClose();
        }}
      >
        <Pressable
          onPress={() => {}}
          className="bg-white rounded-24 p-6 w-[90%] "
          style={{
            borderRadius: 16,
            width: "90%",
            gap: 20,
            ...(step === "change-key" ? { height: 400 } : null),
          }}
        >
          <View className="flex items-end bg-slate-500">
            <Ionicons
              name="close"
              size={20}
              color={Colors.gray.primary}
              onPress={() => {
                setStep("confirm");
                onClose();
              }}
            />
          </View>

          {step === "confirm" && (
            <>
              <Text className="text-center text-lg font-bold text-gray-900">
                Confirmar Saque
              </Text>
              <Text className="text-center text-2xl font-bold text-gray-900 my-5">
                R$ {formatCurrencyBRL(indications?.data?.saldo)}
              </Text>

              <View className="border border-gray-300 rounded-xl p-4">
                <View className="flex-row items-start">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm">CHAVE PIX DE DESTINO </Text>
                    <Text className="font-semibold text-xl" numberOfLines={1}>
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

              <View className="my-5 gap-3">
                <Pressable
                  style={{
                    backgroundColor: Colors.green.primary,
                    padding: 15,
                    opacity: loading ? 0.5 : 1,
                  }}
                  className="rounded-full   flex-row items-center gap-4 justify-center"
                  disabled={loading}
                  onPress={confirm}
                >
                  {loading ? (
                    <LoadingDots text="Confirmando..." />
                  ) : (
                    <>
                      <Text className="text-center text-lg font-bold text-white">
                        Confirmar
                      </Text>
                      <Ionicons
                        name="arrow-forward-outline"
                        size={20}
                        color={Colors.white}
                      />
                    </>
                  )}
                </Pressable>
                <Pressable
                  style={{ padding: 15, opacity: loading ? 0.5 : 1 }}
                  onPress={() => setStep("change-key")}
                  disabled={loading}
                  className="rounded-full border border-gray-300   flex-row items-center gap-4 justify-center"
                >
                  <Text className="text-center text-lg font-bold ">
                    Alterar Chave
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {step === "change-key" && (
            <View style={{ flex: 1, gap: 10 }}>
              <Text className="text-center text-lg font-bold ">
                Alterar Chave
              </Text>
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

export default ModalConfirm;
