import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import LayoutRegister from "@/layouts/layout-register";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterNewStore } from "@/store/register_new";
import { validatePhone } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Keyboard, StyleSheet, TextInput } from "react-native";

const RegisterPhone: React.FC = () => {
  const { data, setData } = useRegisterNewStore();
  const { register, userRegister } = useAuthStore();
  const { showWarning, AlertDisplay } = useAlerts();
  const phoneRef = React.useRef<TextInput>(null);
  const otpRef = React.useRef<TextInput>(null);

  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const confirmOTP = async () => {
    Keyboard.dismiss();

    setIsLoading(true);
    try {
      const registerData = {
        cpf: data?.cpf,
        phone: phone.replace(/\D/g, ""),
        password: data?.password,
      };

      const response = await api.post("/auth/register", registerData);
      register(response.data.data.token, {
        ...userRegister,
        phone: phone.replace(/\D/g, ""),
        cpf: data?.cpf!,
      });

      router.replace("/(register_new)/register-email");
    } catch (error: any) {
      showWarning(
        "Erro ao verificar código",
        error.response?.data?.message || "Erro ao verificar código",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutRegister
      title="Seu número de telefone"
      subtitle="Para começar, informe seu número."
    >
      <AlertDisplay />
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
        error={phone ? validatePhone(phone) : undefined}
      />

      <ButtonComponent
        title={"Continuar"}
        onPress={() => confirmOTP()}
        disabled={!phone || (isSuccess && code.length !== 6)}
        loading={isLoading}
        iconLeft={null}
      />
    </LayoutRegister>
  );
};

const styles = StyleSheet.create({
  sendCodeContainer: {
    marginTop: 16,
  },
  sendCodeText: {
    fontSize: 14,
    color: Colors.gray.primary,
  },
});

export default RegisterPhone;
