import React, { useState } from "react";
import { Modal, Text, TextInput, View } from "react-native";
import { Header } from "./header-modal";
import ButtonModal from "./button-modal";
import PixKeySelect from "./PixKeySelect";
import { Colors } from "@/constants/Colors";

interface ModalConfirmProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave: () => void;
  onStepChange: (step: "confirm" | "change") => void;
  step: "confirm" | "change";
  valueSelected: number;
  valueToReceive: number;
  pixKey: string;
  keyNew: string;
  onChangeKey: (key: string) => void;
  isLoading: boolean;
}
type PixKeyType = "cpf" | "email" | "phone" | "random";

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  visible,
  onClose,
  onConfirm,
  onSave,
  onStepChange,
  step,
  valueSelected,
  valueToReceive,
  pixKey,
  keyNew,
  onChangeKey,
  isLoading,
}) => {
  const [type, setType] = useState<PixKeyType>("cpf");

  const StepConfirm = () => {
    return (
      <>
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
              }).format(valueSelected)}
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
              }).format(valueToReceive)}
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
            {(keyNew || pixKey).replace(/[^\w\s]/gi, "")}
          </Text>
        </View>

        <Text className="text-center text-gray-700 mt-5">
          Esta chave está correta?
        </Text>
        <ButtonModal
          textButton1="Alterar Chave"
          textButton2="Sim, está correto"
          onConfirm={() => onConfirm()}
          handleChangePress={() => onStepChange("change")}
          loading={isLoading}
        />
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View
          className="bg-white rounded-24 p-6 w-[90%] "
          style={{ borderRadius: 16 }}
        >
          <Header
            title={
              step === "confirm" ? "Confirmar Chave PIX" : "Alterar Chave PIX"
            }
            onClose={onClose}
          />
          {step === "confirm" ? (
            <StepConfirm />
          ) : (
            <>
              <Text className="text-gray-700 mb-4 text-center">
                Insira os dados da nova chave que deseja usar para esta
                transação.
              </Text>
              <View>
                <Text className="text-gray-700 font-semibold mb-2">
                  Tipo de Chave
                </Text>
                <PixKeySelect
                  value={type}
                  onChange={(value) => {
                    setType(value);
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
                  onChangeText={(text) => onChangeKey(text)}
                  value={keyNew}
                  autoCapitalize="none"
                />
              </View>
              <ButtonModal
                textButton1="Cancelar"
                textButton2="Salvar e Continuar"
                onConfirm={() => onSave()}
                handleChangePress={() => onStepChange("confirm")}
                loading={isLoading}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ModalConfirm;
