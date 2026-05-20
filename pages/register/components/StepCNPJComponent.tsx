import ButtonComponent from "@/components/ui/Button";
import ButtonChat from "@/components/ui/ButtonChat";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { validateCNPJ } from "@/utils/validation";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";

interface StepCNPJProps {
  onNext: (cnpj: string) => void | Promise<void>;
  isLoading: boolean;
}

const StepCNPJComponents: React.FC<StepCNPJProps> = ({ onNext, isLoading }) => {
  const [CNPJ, setCNPJ] = React.useState("");
  const submit = async () => {
    if (!CNPJ || !!validateCNPJ(CNPJ)) {
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
        error={CNPJ ? validateCNPJ(CNPJ) : ""}
      />

      <ButtonComponent
        title="Continuar"
        iconLeft={null}
        loading={isLoading}
        disabled={isLoading || !CNPJ || !!validateCNPJ(CNPJ)}
        onPress={submit}
      />

      <ButtonChat />
    </>
  );
};

export default StepCNPJComponents;
