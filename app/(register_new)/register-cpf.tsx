import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Keyboard, TextInput } from "react-native";
import { validateCPF, validateBirthDate18Plus } from "@/utils/validation";
import { checkCPF } from "@/services/check-cpf";
import { useAlerts } from "@/components/useAlert";
import LayoutRegister from "@/layouts/layout-register";
import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { router } from "expo-router";
import { useRegisterNewStore } from "@/store/register_new";
import { useRegisterAuthStore } from "@/store/register";
import api from "@/services/api";
import { formatarData } from "@/utils/formats";

const RegisterCPF: React.FC = () => {
  const { showWarning, AlertDisplay, showError } = useAlerts();
  const { setData } = useRegisterNewStore();
  const { cpf: cpfAuth } = useRegisterAuthStore();
  const cpfRef = useRef<TextInput>(null);
  const birthDateRef = useRef<TextInput>(null);
  const [cpf, setCpf] = useState(cpfAuth || "");
  const [birthDate, setBirthDate] = useState("");
  const [cpfTouched, setCpfTouched] = useState(false);
  const [birthDateTouched, setBirthDateTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    Keyboard.dismiss();
    const cpfErr = validateCPF(cpf);
    const dateErr = validateBirthDate18Plus(birthDate);
    setCpfTouched(true);
    setBirthDateTouched(true);
    if (cpfErr || dateErr) {
      return;
    }
    setIsLoading(true);
    try {
      const formattedBirthDate = formatarData(birthDate);

      const { data } = await api.get(
        `/auth/search/cpf/${cpf}/${formattedBirthDate}`,
      );

      console.log("data cpf", data);

      if (data?.data?.status === "recusado") {
        showError("Atenção", "Data de Nascimento inválida");
        return;
      }

      const response: any = await checkCPF(cpf, formattedBirthDate!);
      console.log("response cpf", response);
      if (response.message === "Cadastro Localizado") {
        showWarning("Alerta!", "O CPF informado já está cadastrado. ");
        return;
      } else {
        setData({
          ...data,
          cpf,
        });
        router.push("/(register_new)/register-password");
        return;
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        showWarning(
          "Atenção",
          "Você fez muitas requisições, aguarde um momento e tente novamente.",
        );
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutRegister
      title="Olá! Vamos começar."
      subtitle="Para iniciar seu cadastro, informe seu CPF e data de nascimento."
    >
      <AlertDisplay />
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
        onBlur={() => setCpfTouched(true)}
        error={cpfTouched ? validateCPF(cpf) : undefined}
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
        onBlur={() => setBirthDateTouched(true)}
        error={
          birthDateTouched ? validateBirthDate18Plus(birthDate) : undefined
        }
        onSubmitEditing={handleNext}
      />
      <ButtonComponent
        title="Continuar"
        onPress={handleNext}
        iconRight="arrow-forward"
        iconLeft={null}
        loading={isLoading}
      />
    </LayoutRegister>
  );
};

export default RegisterCPF;
