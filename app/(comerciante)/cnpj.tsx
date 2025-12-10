import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

const InformandoCNPJ: React.FC = () => {
  const { mutate, isPending } = useUpdateUserMutation();
  const [businessType, setBusinessType] = React.useState("");

  const submit = () => {
    mutate({
      request: {
        cnpj: businessType,
        etapa: Etapas.COMERCIANTE_ENVIANDO_EXTRATO,
      },
    });
  };

  return (
    <LayoutRegister
      title="Informe seu CNPJ"
      subtitle="Digite os números do seu CNPJ."
    >
      <InputComponent
        label="CNPJ"
        placeholder="00.000.000/0000-00"
        value={businessType}
        onChangeText={setBusinessType}
        icon={
          <FontAwesome name="building" size={20} color={Colors.gray.primary} />
        }
        maskType="cnpj"
      />

      <ButtonComponent
        title="Continuar"
        iconLeft={null}
        loading={isPending}
        disabled={isPending || !businessType}
        onPress={submit}
      />
    </LayoutRegister>
  );
};

export default InformandoCNPJ;
