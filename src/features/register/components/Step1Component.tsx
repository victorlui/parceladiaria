import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import { Colors } from "@/shared/constants/colors";
import { isValidCPF, isValidDateOfBirth } from "@/shared/utils/validate";
import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { TextInput } from "react-native";

type Props = {
  onNext: (cpf: string, birthDate: string) => void | Promise<void>;
  isLoading: boolean;
};

const Step1Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { user } = useAuthStore();
  const cpfRef = useRef<TextInput>(null);
  const birthDateRef = useRef<TextInput>(null);
  const [cpf, setCpf] = useState(user?.cpf || "");
  const [birthDate, setBirthDate] = useState("");

  const onSubmit = () => {
    onNext(cpf, birthDate);
  };
  return (
    <>
      <InputComponent
        ref={cpfRef}
        placeholder="Seu CPF"
        keyboardType="numeric"
        maxLength={11}
        value={cpf}
        maskType="cpf"
        icon={
          <FontAwesome name="vcard" size={20} color={Colors.gray.primary} />
        }
        onChangeText={setCpf}
        returnKeyType="next"
        onSubmitEditing={() => birthDateRef.current?.focus()}
        error={cpf && !isValidCPF(cpf) ? "CPF inválido" : ""}
      />
      <InputComponent
        ref={birthDateRef}
        placeholder="dd/mm/aaaa"
        keyboardType="numeric"
        maxLength={10}
        value={birthDate}
        maskType="date"
        icon={
          <FontAwesome name="calendar" size={20} color={Colors.gray.primary} />
        }
        onChangeText={setBirthDate}
        returnKeyType="done"
        error={
          birthDate && !isValidDateOfBirth(birthDate)
            ? "Data de nascimento inválida"
            : ""
        }
        onSubmitEditing={onSubmit}
      />
      <ButtonComponent
        title="Continuar"
        onPress={onSubmit}
        iconRight="arrow-forward"
        iconLeft={null}
        loading={isLoading}
        disabled={
          !isValidCPF(cpf) || !isValidDateOfBirth(birthDate) || isLoading
        }
      />
    </>
  );
};

export default Step1Component;
