import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import { Colors } from "@/shared/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";

interface Step7Component {
  onNext: (businessType: string) => void | Promise<void>;
  isLoading: boolean;
}

const Step7Component: React.FC<Step7Component> = ({ onNext, isLoading }) => {
  const [businessType, setBusinessType] = React.useState("");
  const submit = async () => {
    if (!businessType) {
      return;
    }
    await onNext(businessType);
  };

  return (
    <>
      <InputComponent
        label="Tipo de comércio"
        placeholder="Ex: Barbearia, Lanchonete, Oficina, etc."
        value={businessType}
        onChangeText={setBusinessType}
        returnKeyType="done"
        onSubmitEditing={submit}
        autoCapitalize="words"
        icon={
          <MaterialIcons
            name="business-center"
            size={24}
            color={Colors.gray.primary}
          />
        }
      />

      <ButtonComponent
        title="Continuar"
        iconLeft={null}
        loading={isLoading}
        disabled={isLoading || !businessType}
        onPress={submit}
      />
    </>
  );
};

export default Step7Component;
