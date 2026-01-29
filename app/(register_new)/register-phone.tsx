import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import LayoutRegister from "@/layouts/layout-register";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterAuthStore } from "@/store/register";
import { useRegisterNewStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { validatePhone } from "@/utils/validation";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [showOtpError, setShowOtpError] = React.useState(false);
  const [timer, setTimer] = React.useState(0);

  React.useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendCode = async () => {
    Keyboard.dismiss();
    if (validatePhone(phone) || !phone) {
      return;
    }
    setIsLoading(true);
    try {
      const response: any = await api.post("/auth/otp/generate", {
        phone,
        cpf: data?.cpf,
        method: "sms",
      });
      setIsSuccess(true);
      setShowOtpError(false);
      setTimer(60);
      console.log("response", response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        showWarning(
          "Atenção",
          "Você fez muitas requisições, aguarde um momento e tente novamente."
        );
        return;
      }
      showWarning(
        "Erro ao enviar código",
        error.response?.data?.data || "Erro ao enviar código"
      );
      console.log("error", error.response);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmOTP = async () => {
    Keyboard.dismiss();
    if (code.length !== 6) {
      setShowOtpError(true);
      return;
    }
    setShowOtpError(false);
    setIsLoading(true);
    try {
      await api.post("/auth/otp/check", {
        phone,
        password: data?.password,
        cpf: data?.cpf,
        otp: code,
      });

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
      // NOVO  setData({
      //     ...data,
      //     token: response.data.data.token,
      //     etapa: Etapas.INICIO,
      //   });
      router.replace("/(register_new)/register-email");
    } catch (error: any) {
      console.log("error", error.response);
      showWarning(
        "Erro ao verificar código",
        error.response?.data?.message || "Erro ao verificar código"
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
        onSubmitEditing={sendCode}
        error={phone ? validatePhone(phone) : undefined}
      />

      {isSuccess && (
        <InputComponent
          ref={otpRef}
          placeholder="Digite o código de 6 dígitos"
          keyboardType="numeric"
          maxLength={6}
          value={code}
          icon={
            <Ionicons name="key-sharp" size={20} color={Colors.gray.primary} />
          }
          onChangeText={setCode}
          returnKeyType="done"
          onSubmitEditing={confirmOTP}
          error={
            showOtpError && code.length !== 6 ? "Código inválido" : undefined
          }
        />
      )}

      <ButtonComponent
        title={isSuccess ? "Verificar Código" : "Confirmar"}
        onPress={isSuccess ? confirmOTP : sendCode}
        disabled={!phone || (isSuccess && code.length !== 6)}
        loading={isLoading}
        iconLeft={null}
      />
      {isSuccess &&
        (timer > 0 ? (
          <View style={styles.sendCodeContainer}>
            <Text style={styles.sendCodeText}>Reenviar código em {timer}s</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.sendCodeContainer} onPress={sendCode}>
            <Text style={styles.sendCodeText}>
              Não recebeu? Reenviar código
            </Text>
          </TouchableOpacity>
        ))}
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
