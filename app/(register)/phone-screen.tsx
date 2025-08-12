import { useEffect, useState } from "react";
import {
  Keyboard,
  Text,
  TouchableOpacity,
  View,
  Alert,
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
  const { AlertDisplay, showWarning, showSuccess, showError } = useAlerts();
  const mutation = useCheckOTPMutation();
  const [sendCode, setSendCode] = useState(false);
  const [code, setCode] = useState("");

  const number = getValues("phone");

  useEffect(() => {
    if (mutation.isError) {
      showError("Erro", mutation.error.message);
    }
  }, [mutation.isError, mutation.error]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mutation.isSuccess) {
      showSuccess("Sucesso", "Código verificado com sucesso", () =>
        router.push("/(register)/create-password")
      );
    }
  }, [mutation.isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

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
    mutate({ phone: data?.data.phone ?? "", method: "whatsapp" });
    showSuccess("Código enviado", "Novo código foi enviado");
  };

  const handleSendCode = (code: string) => {
    Keyboard.dismiss();
    setPhone(number);
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
                <TouchableOpacity onPress={() => setSendCode(false)}>
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
                className="mb-6 w-full justify-end items-end"
                onPress={handleSubmitagain}
              >
                <Text className="text-end text-blue-600 text-md font-semibold">
                  Receber código via whatsApp
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LayoutRegister>
    </>
  );
}
