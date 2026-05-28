import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import { Colors } from "@/shared/constants/colors";
import { isValidCNPJ } from "@/shared/utils/validate";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";

interface StepCNPJProps {
  onNext: (cnpj: string) => void | Promise<void>;
  isLoading: boolean;
}

const Step6Component: React.FC<StepCNPJProps> = ({ onNext, isLoading }) => {
  const [CNPJ, setCNPJ] = React.useState("");
  const submit = async () => {
    if (!CNPJ || !isValidCNPJ(CNPJ)) {
      return;
    }
    await onNext(CNPJ);
  };

  return (
    <>
      <InputComponent
        label="CNPJ"
        placeholder="00.000.000/0000-00"
        value={CNPJ}
        onChangeText={setCNPJ}
        icon={
          <FontAwesome name="building" size={20} color={Colors.gray.primary} />
        }
        maskType="cnpj"
        returnKeyType="done"
        onSubmitEditing={submit}
        autoCapitalize="none"
        error={CNPJ && !isValidCNPJ(CNPJ) ? "CNPJ inválido" : ""}
      />

      <ButtonComponent
        title="Continuar"
        iconLeft={null}
        loading={isLoading}
        disabled={isLoading || !CNPJ || !isValidCNPJ(CNPJ)}
        onPress={submit}
      />
    </>
  );
};

export default Step6Component;
