import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PixKeySelect from "./PixKeySelect";
import { Colors } from "@/constants/Colors";
import ButtonModal from "./button-modal";

interface Props {
  onSave: (newKey: string, type: string) => void;
  onStepChange: (step: "confirm" | "change-key") => void;
  isLoading: boolean;
}

const ChangeKey: React.FC<Props> = ({ onSave, onStepChange, isLoading }) => {
  const [type, setType] = useState<"cpf" | "email" | "phone" | "random">("cpf");
  const [keyNew, setKeyNew] = useState<string>("");

  const onChangeKey = (text: string) => {
    setKeyNew(text);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        >
          <View>
            <Text className="text-gray-700 mb-4 text-center">
              Insira os dados da nova chave que deseja usar para esta transação.
            </Text>
            <View>
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
                keyboardType={type === "cpf" ? "number-pad" : "default"}
                onChangeText={(text) => onChangeKey(text)}
                value={keyNew}
                autoCapitalize="none"
                onSubmitEditing={Keyboard.dismiss}
                returnKeyType="done"
              />
              <ButtonModal
                textButton1="Cancelar"
                textButton2="Salvar"
                onConfirm={() => {
                  Keyboard.dismiss();
                  onSave(keyNew, type);
                }}
                handleChangePress={() => onStepChange("confirm")}
                loading={isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChangeKey;
