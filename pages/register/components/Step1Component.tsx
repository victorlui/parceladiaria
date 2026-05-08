import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { Colors } from "@/constants/Colors";
import { useRegisterStore } from "@/store/register_new";
import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { TextInput } from "react-native";
import { validateBirthDate18Plus, validateCPF } from "@/utils/validation";

// import { Container } from './styles';

type Props = {
  onNext: (cpf: string, birthDate: string) => void | Promise<void>;
  isLoading: boolean;
};

const Step1Component: React.FC<Props> = ({ onNext, isLoading }) => {
  const { data } = useRegisterStore();
  const cpfRef = useRef<TextInput>(null);
  const birthDateRef = useRef<TextInput>(null);
  const [cpf, setCpf] = useState(data?.cpf || "");
  const [birthDate, setBirthDate] = useState(
    data?.nascimento ? data.nascimento.split("-").reverse().join("/") : "",
  );

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
        error={cpf && !validateCPF(cpf) ? "CPF inválido" : ""}
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
          birthDate && !validateBirthDate18Plus(birthDate)
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
        disabled={!validateCPF(cpf) || !validateBirthDate18Plus(birthDate)}
      />
    </>
  );
};

export default Step1Component;
