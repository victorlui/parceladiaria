import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import { Colors } from "@/shared/constants/colors";
import { isValidEmail } from "@/shared/utils/validate";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TextInput } from "react-native";

interface Props {
  onNext: (email: string) => void | Promise<void>;
  isLoading: boolean;
}

const Step9Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { user } = useAuthStore();
  const emailRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState(user?.email || "");

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
        error={email && !isValidEmail(email) ? "Email inválido" : ""}
        value={email}
        onChangeText={setEmail}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />

      <ButtonComponent
        title="Continuar"
        onPress={onSubmit}
        disabled={!email || !isValidEmail(email)}
        loading={isLoading}
        iconLeft={null}
      />
    </>
  );
};

export default Step9Component;
