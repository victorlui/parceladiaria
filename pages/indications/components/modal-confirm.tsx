import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useAlerts } from "@/components/useAlert";
import { IndicationResponse } from "../types/indications";
import { Modal, Pressable, Text, View } from "react-native";
import { formatCurrencyBRL } from "@/utils/formats";
import ModalChangepix from "./modal-change-pix";
import api from "@/services/api";
import LoadingDots from "@/components/ui/LoadingDots";

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
  const [changeKey, setChangeKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/v1/affiliate/withdraw");
      console.log("data", data);
      if (data.success && data.data) {
        onSuccess(data.data.status, data.data.valor_sacado);
      }
      onClose();
    } catch (error: any) {
      console.log("error ao confirmar saque", error.response);
      showError("Error", error.response?.data?.message || error.message);
      return;
    } finally {
      setLoading(false);
    }
  };

  if (changeKey) {
    return (
      <ModalChangepix
        visible={visible}
        onClose={() => {
          setChangeKey(false);
        }}
        onChangePixKey={onChangePixKey}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={() => onClose()}
    >
      <AlertDisplay />
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center"
        onPress={() => onClose()}
      >
        <View
          className="bg-white rounded-24 p-6 w-[90%] "
          style={{ borderRadius: 16, width: "90%", gap: 20 }}
        >
          <View className="flex items-end bg-slate-500">
            <Ionicons
              name="close"
              size={20}
              color={Colors.gray.primary}
              onPress={() => onClose()}
            />
          </View>
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
              <FontAwesome6 name="pix" size={20} color={Colors.green.text} />
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
              onPress={() => setChangeKey(true)}
              disabled={loading}
              className="rounded-full border border-gray-300   flex-row items-center gap-4 justify-center"
            >
              <Text className="text-center text-lg font-bold ">
                Alterar Chave
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ModalConfirm;
