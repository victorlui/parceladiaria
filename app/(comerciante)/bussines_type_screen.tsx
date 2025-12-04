import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { Etapas } from "@/utils";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";

const BusinessTypeScreen: React.FC = () => {
  const { mutate, isPending } = useUpdateUserMutation();
  const [businessType, setBusinessType] = React.useState("");

  const submit = () => {
    mutate({
      request: {
        tipo_comercio: businessType,
        etapa: Etapas.COMERCIANTE_ENVIANDO_VIDEO_FACHADA,
      },
    });
  };

  return (
    <LayoutRegister
      title="Qual o seu tipo de comércio?"
      subtitle="Ex: Barbearia, Lanchonete, Oficina, etc."
    >
      <InputComponent
        label="Tipo de comércio"
        placeholder="Ex: Barbearia, Lanchonete, Oficina, etc."
        value={businessType}
        onChangeText={setBusinessType}
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
        loading={isPending}
        disabled={isPending || !businessType}
        onPress={submit}
      />
    </LayoutRegister>
  );
};

export default BusinessTypeScreen;
