import { useEffect, useState, useRef } from "react";
import {
  Keyboard,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import AppleOTPInput from "@/components/AppleOTP";
import { FormInput } from "@/components/FormInput";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { usePhoneForm } from "@/hooks/useRegisterForm";
import {
  useRegisterMutation,
  useCheckOTPMutation,
} from "@/hooks/useRegisterMutation";
import { PhoneSchema } from "@/lib/phone_validation";
import { useRegisterAuthStore } from "@/store/register";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAlerts } from "@/components/useAlert";
import { router } from "expo-router";

export default function PhoneScreen() {
  const { control, handleSubmit, getValues } = usePhoneForm();
  const { mutate, isPending, data } = useRegisterMutation();
  const { setPhone } = useRegisterAuthStore();
  const { AlertDisplay, showWarning, showSuccess, showError,hideAlert } = useAlerts();
  const mutation = useCheckOTPMutation();
  const [sendCode, setSendCode] = useState(false);
  const [code, setCode] = useState("");
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const number = getValues("phone");

  useEffect(() => {
    if (mutation.isError) {
      showError("Erro", mutation.error.message);
    }
  }, [mutation.isError, mutation.error]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mutation.isSuccess && !hasShownSuccess) {
      setHasShownSuccess(true);
      showSuccess("Sucesso", "Código verificado com sucesso", () => {
        hideAlert();
        router.push("/(register)/create-password");
      });
    }
  }, [mutation.isSuccess, hasShownSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer effect for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resendTimer, canResend]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const onSubmit = (data: PhoneSchema) => {
    if (data.phone.length !== 11) {
      showError(
        "Erro",
        "Número de telefone inválido. Digite 11 dígitos incluindo DDD"
      );
      return;
    }

    const areaCode = data.phone.substring(0, 2);
    if (parseInt(areaCode) < 11 || parseInt(areaCode) > 99) {
      showError("Erro", "DDD inválido");
      return;
    }

    // If validation passes, proceed with sending code
    Keyboard.dismiss();
    setSendCode(true);
    mutate({ phone: data.phone, method: "sms" });
  };

  const handleSubmitagain = () => {
    if (!canResend) return;
    
    const phoneNumber = data?.data?.phone ?? number ?? "";
    if (!phoneNumber) {
      showError("Erro", "Número de telefone não encontrado");
      return;
    }

    mutate({ phone: phoneNumber, method: "whatsapp" });
    showSuccess("Código enviado", "Novo código foi enviado via WhatsApp");
    
    // Start 15 second timer
    setCanResend(false);
    setResendTimer(15);
  };

  const handleSendCode = (code: string) => {
    if (!code || code.length !== 6) {
      showWarning("Atenção", "Insira um código válido de 6 dígitos");
      return;
    }

    Keyboard.dismiss();
    setPhone(number);
    hideAlert();
    
    mutation.mutate({
      phone: number ?? "",
      code,
    });
  };

  return (
    <>
      <AlertDisplay />
      <LayoutRegister
        onContinue={
          !sendCode
            ? handleSubmit(onSubmit)
            : code
              ? () => handleSendCode(code)
              : () => showWarning("Atenção", "Insira o código de verificação")
        }
        isBack={true}
        loading={isPending}
        isLogo={false}
      > 
        <View className="flex-1 justify-between px-6 py-8">
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/apenas-logo.png")}
              className="w-full h-48"
              resizeMode="contain"
            />
          </View>

          <View className="items-center mb-8">
            <View className="bg-[#9BD13D] p-4 rounded-2xl shadow-md">
              <MaterialCommunityIcons name="phone" size={40} color="white" />
            </View>
          </View>

          <View className="flex-1 justify-center">
            {!sendCode && (
              <Text className="text-gray-700 text-xl text-center mb-5 ">
                Por favor, insira seu número de telefone (WhatsApp) para receber
                um código de verificação.
              </Text>
            )}
            {sendCode && (
              <View className="flex-row flex-wrap items-center justify-center  mb-5">
                <Text className="my-5 text-center">
                  <Text className=" text-gray-700 text-xl">
                    Um código de 6 digitos foi enviado para o número{" "}
                  </Text>
                  <Text style={{ fontWeight: 900, fontSize: 18 }}>
                    {number?.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3") ||
                      ""}
                  </Text>
                </Text>
                <TouchableOpacity onPress={() => {
                  setSendCode(false);
                  setHasShownSuccess(false);
                  setCanResend(true);
                  setResendTimer(0);
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                  }
                }}>
                  <Text className="text-blue-600 text-xl font-medium  underline">
                    Mudar o número
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!sendCode && (
              <FormInput
                name="phone"
                placeholder="(00) 00000-0000"
                control={control}
                rules={{ required: "Telefone é obrigatório" }}
                maskType="phone"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                icon={
                  <FontAwesome name="phone-square" size={24} color="#9CA3AF" />
                }
              />
            )}

            {sendCode && (
              <AppleOTPInput
                sendCode={(code) => {
                  setCode(code);
                  handleSendCode(code);
                }}
              />
            )}

            {sendCode && (
              <TouchableOpacity
                className={`mb-6 w-full justify-end items-end ${
                  !canResend ? 'opacity-50' : ''
                }`}
                onPress={handleSubmitagain}
                disabled={!canResend}
              >
                <Text className={`text-end text-md font-semibold ${
                  canResend ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {canResend 
                    ? 'Receber código via WhatsApp'
                    : `Aguarde ${resendTimer}s para reenviar`
                  }
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LayoutRegister>
    </>
  );
}
