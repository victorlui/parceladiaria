import ButtonComponent from "@/components/ui/Button";
import ButtonChat from "@/components/ui/ButtonChat";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { useRegisterStore } from "@/store/register_new";
import { validateEmail } from "@/utils/validation";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TextInput } from "react-native";

interface Props {
  onNext: (email: string) => void | Promise<void>;
  isLoading: boolean;
}

const Step6Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { data } = useRegisterStore();
  const emailRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState(data?.email || "");

  const onSubmit = () => {
    onNext(email);
  };

  return (
    <>
      <InputComponent
        ref={emailRef}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
        icon={
          <MaterialIcons name="email" size={20} color={Colors.gray.primary} />
        }
        error={email && !validateEmail(email) ? "Email inválido" : ""}
        value={email}
        onChangeText={setEmail}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <ButtonComponent
        title="Continuar"
        onPress={onSubmit}
        disabled={!email || !validateEmail(email)}
        loading={isLoading}
        iconLeft={null}
      />

      <ButtonChat />
    </>
  );
};

export default Step6Component;
