import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import PixKeySelect from "@/components/renew/PixKeySelect";
import { useAuthStore } from "@/store/auth";
import ButtonModal from "./button-modal";
import api from "@/services/api";
import { Header } from "./header-modal";
import { validateCPF, validateEmail, validatePhone } from "@/utils/validation";

// Tipos possíveis de chave PIX
type PixKeyType = "cpf" | "email" | "phone" | "random";

interface ModalConfirmProps {
  visible: boolean;
  onClose: () => void;
  selectedAmount: number; // Valor selecionado
  youReceive: number; // Você recebe
  pixKey: string; // Chave atual
  idLoan: number; // ID do empréstimo
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  visible,
  onClose,
  selectedAmount,
  youReceive,
  pixKey,
  idLoan,
}) => {
  const { user, setUser } = useAuthStore((state) => state);
  const [key, setKey] = React.useState<string>("");
  const [step, setStep] = React.useState<"confirm" | "change">("confirm");
  const [type, setType] = React.useState<PixKeyType>("cpf");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorValidation, setErrorValidation] = React.useState<string>("");

  const handleChangePress = () => {
    setKey("");
    setStep("change");
    setErrorValidation("");
  };

  const handleSaveContinue = async () => {
    const trimmedKey = key.trim();

    if (type === "cpf") {
      const isValid = validateCPF(trimmedKey);

      if (isValid !== "") {
        setErrorValidation(isValid);
        return;
      }

      return;
    }

    if (type === "email") {
      const isValid = validateEmail(trimmedKey);

      if (isValid !== "") {
        setErrorValidation(isValid);
        return;
      }

      return;
    }

    if (type === "phone") {
      const isValid = validatePhone(trimmedKey);

      if (isValid !== "") {
        setErrorValidation(isValid);
        return;
      }

      return;
    }

    setUser({ ...user, pixKey: trimmedKey });
    setStep("confirm");
  };

  const handleConfirmLoan = async () => {
    console.log("confirmar emprestimos", idLoan);
  };

  const ConfirmLayout = () => (
    <View className="mx-5 bg-white rounded-2xl p-5">
      <Header title="Alterar Chave PIX" onClose={onClose} />

      <View className="bg-[#F9F9F9] rounded-xl px-4 py-3 gap-2">
        <View className="flex-row justify-between gap-2">
          <Text style={{ fontSize: 14, fontWeight: "400" }}>
            Valor selecionado:
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
            }).format(selectedAmount)}
          </Text>
        </View>
        <View className="flex-row justify-between gap-2">
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Valor recebe:
          </Text>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 2,
            }).format(youReceive)}
          </Text>
        </View>
      </View>

      <Text
        className="mt-4 text-center"
        style={{ fontSize: 14, color: "#6B7280", lineHeight: 23 }}
      >
        O valor será enviado para a sua chave PIX cadastrada abaixo:
      </Text>

      <View className="mt-3 border border-gray-200 rounded-xl px-4 py-3">
        <Text className="text-gray-900 font-semibold text-center">
          {(user?.pixKey || pixKey).replace(/\D/g, "")}
        </Text>
      </View>

      <Text className="text-center text-gray-700 mt-5">
        Esta chave está correta?
      </Text>
      <ButtonModal
        textButton1="Alterar Chave"
        textButton2="Sim, está correto"
        onConfirm={handleConfirmLoan}
        handleChangePress={handleChangePress}
        loading={loading}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        {step === "change" && (
          <View
            style={{
              flex: 1,
              width: "100%",
              padding: 20,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              className="bg-white rounded-2xl p-5"
              style={{ width: "100%" }}
            >
              <Header title="Alterar Chave PIX" onClose={onClose} />

              <Text className="text-gray-700 mb-4 text-center">
                Insira os dados da nova chave que deseja usar para esta
                transação.
              </Text>
              <Text className="text-gray-700 font-semibold mb-2">
                Tipo de Chave
              </Text>
              <PixKeySelect
                value={type}
                onChange={(value) => {
                  setType(value);
                  setKey("");
                  setErrorValidation("");
                }}
              />
              <Text className="text-gray-700 font-semibold mt-2 mb-2">
                Chave PIX
              </Text>
              <TextInput
                placeholder="Digite a nova chave PIX"
                style={{
                  borderWidth: 1,
                  borderColor: Colors.green.primary,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                }}
                onChangeText={(text) => setKey(text)}
                value={key}
                autoCapitalize="none"
              />

              {errorValidation && (
                <View className="bg-red-200 rounded-xl px-4 py-3 gap-2">
                  <Text className="text-red-500 text-center">
                    {errorValidation}
                  </Text>
                </View>
              )}

              <ButtonModal
                textButton1="Cancelar"
                textButton2="Salvar e Continuar"
                onConfirm={handleSaveContinue}
                handleChangePress={() => setStep("confirm")}
                loading={loading}
              />
            </View>
          </View>
        )}

        {step === "confirm" && <ConfirmLayout />}
      </View>
    </Modal>
  );
};

export default ModalConfirm;
