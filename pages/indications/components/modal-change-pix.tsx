import ButtonModal from "@/components/renew/button-modal";
import PixKeySelect from "@/components/renew/PixKeySelect";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Text, TextInput, View } from "react-native";
import { validateEmail, validatePhone } from "@/utils/validation";
import { useAlerts } from "@/components/useAlert";
import api from "@/services/api";

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

    console.log("validateEmail(keyNew)", validateEmail(keyNew));
    console.log("keyNew", keyNew);

    if (type === "email" && validateEmail(keyNew)) {
      return showError("Atenção", "E-mail inválido");
    }
    if (type === "phone" && validatePhone(keyNew)) {
      return showError("Atenção", "Telefone inválido");
    }

    try {
      setLoading(true);
      const { data } = await api.get("/v1/search/dict", {
        params: {
          pixKey: keyNew,
          type: type === "random" ? "evp" : type,
        },
      });
      console.log("data", data);
      onChangePixKey(keyNew);
      showSuccess("Sucesso", "Chave Pix alterada com sucesso", () => {
        onClose();
      });
    } catch (error: any) {
      console.log("error ao alterar chave Pix", error.response);
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
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View
          className="bg-white rounded-24 p-6 w-[90%] "
          style={{ borderRadius: 16 }}
        >
          <View className="flex items-end bg-slate-500">
            <Ionicons
              name="close"
              size={20}
              color={Colors.gray.primary}
              onPress={() => onClose()}
            />
          </View>
          <Text className="text-center text-xl font-bold text-gray-900">
            Alterar chave
          </Text>
          <View className="my-5">
            <Text className="text-gray-700 font-semibold mb-2">
              Tipo de Chave
            </Text>
            <PixKeySelect
              value={type}
              onChange={(value) => {
                setType(value);
                setKeyNew("");
              }}
            />
            <Text className="text-gray-700 font-semibold mt-2 mb-2">
              Nova Chave
            </Text>
            <TextInput
              placeholder="Digite a nova chave"
              style={{
                borderWidth: 1,
                borderColor: Colors.borderColor,
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
              }}
              placeholderTextColor="black"
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
        </View>
      </View>
    </Modal>
  );
};

export default ModalChangepix;
