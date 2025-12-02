import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { useRegisterAuthStore } from "@/store/register";
import { Etapas } from "@/utils";
import { validateEmail } from "@/utils/validation";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TextInput } from "react-native";

const RegisterEmail: React.FC = () => {
  const { setEmail: setEmailAuth } = useRegisterAuthStore();
  const { mutate, isPending } = useUpdateUserMutation();
  const emailRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState("");

  const onSubmit = () => {
    const request = {
      email: email,
      etapa: Etapas.REGISTRANDO_PIX,
    };
    setEmailAuth(email!);
    mutate({ request: request });
  };

  return (
    <LayoutRegister
      title="Qual o seu e-mail?"
      subtitle="Ele será usado para o seu cadastro e acesso."
    >
      <InputComponent
        ref={emailRef}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        icon={
          <MaterialIcons name="email" size={20} color={Colors.gray.primary} />
        }
        error={email ? validateEmail(email) : undefined}
        value={email}
        onChangeText={setEmail}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <ButtonComponent
        title="Continuar"
        onPress={onSubmit}
        disabled={!email || !!validateEmail(email)}
        loading={isPending}
      />
    </LayoutRegister>
  );
};

export default RegisterEmail;
