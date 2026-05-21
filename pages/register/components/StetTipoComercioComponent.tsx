import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";

interface StetTipoComercioProps {
  onNext: (businessType: string) => void | Promise<void>;
  isLoading: boolean;
}

const StetTipoComercioComponent: React.FC<StetTipoComercioProps> = ({
  onNext,
  isLoading,
}) => {
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

export default StetTipoComercioComponent;
