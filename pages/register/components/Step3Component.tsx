import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { validatePhone } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput } from "react-native";
import { useRegisterStore } from "@/store/register_new";

type Props = {
  onNext: (password: string) => void | Promise<void>;
  isLoading: boolean;
};

const Step3Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { data } = useRegisterStore();
  const phoneRef = React.useRef<TextInput>(null);
  const [phone, setPhone] = React.useState(data?.phone || data?.whatsapp || "");

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
        error={phone && !validatePhone(phone) ? "Telefone inválido" : ""}
        onSubmitEditing={onSubmit}
      />

      <ButtonComponent
        title={"Continuar"}
        onPress={() => onSubmit()}
        disabled={!phone || !validatePhone(phone)}
        loading={isLoading}
        iconLeft={null}
      />
    </>
  );
};

export default Step3Component;
