import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import { Colors } from "@/shared/constants/colors";
import { isValidPhone } from "@/shared/utils/validate";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput } from "react-native";

type Props = {
  onNext: (password: string) => void | Promise<void>;
  isLoading: boolean;
};

const Step3Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { user } = useAuthStore();
  const phoneRef = React.useRef<TextInput>(null);
  const [phone, setPhone] = React.useState(user?.whatsapp || "");

  const onSubmit = () => {
    onNext(phone);
  };

  return (
    <>
      <InputComponent
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        maskType="cellphone"
        icon={
          <Ionicons name="call-sharp" size={20} color={Colors.gray.primary} />
        }
        ref={phoneRef}
        value={phone}
        onChangeText={setPhone}
        returnKeyType="done"
        error={phone && !isValidPhone(phone) ? "Telefone inválido" : ""}
        onSubmitEditing={onSubmit}
      />

      <ButtonComponent
        title={"Continuar"}
        onPress={() => onSubmit()}
        disabled={!phone || !isValidPhone(phone)}
        loading={isLoading}
        iconLeft={null}
      />
    </>
  );
};

export default Step3Component;
