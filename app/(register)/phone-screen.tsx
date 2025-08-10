import AppleOTPInput from "@/components/AppleOTP";
import { Button } from "@/components/Button";
import { FormInput } from "@/components/FormInput";
import Spinner from "@/components/Spinner";
import { usePhoneForm } from "@/hooks/useRegisterForm";
import {
  useRegisterMutation,
  useCheckOTPMutation,
} from "@/hooks/useRegisterMutation";
import { PhoneSchema } from "@/lib/phone_validation";
import { useRegisterAuthStore } from "@/store/register";
import { useState } from "react";

import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PhoneScreen() {
  const { control, handleSubmit, getValues } = usePhoneForm();
  const { mutate, isPending, data } = useRegisterMutation();
  const { setPhone } = useRegisterAuthStore();
  const mutation = useCheckOTPMutation();
  const [sendCode, setSendCode] = useState(false);

  const number = getValues("phone");

  const onSubmit = (data: PhoneSchema) => {
    Keyboard.dismiss();
    setSendCode(true);
    mutate({ phone: data.phone, method: "sms" });
  };

  const handleSubmitagain = () => {
    mutate({ phone: data?.data.phone ?? "", method: "sms" });
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
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-white justify-center  px-8"
    >
      {(isPending || mutation.isPending) && <Spinner />}

      <Image
        source={require("@/assets/images/apenas-logo.png")}
        className="w-full h-56"
      />
      {!sendCode && (
        <Text className="text-gray-700 text-xl text-center my-5">
          Por favor, insira seu número de telefone para receber um código de
          verificação.
        </Text>
      )}
      {sendCode && (
        <View className="flex-row flex-wrap items-center justify-center  my-5">
          <Text className="my-5 text-center">
            <Text className=" text-gray-700 text-xl">
              Um código de 6 digitos foi enviado para o número{" "}
            </Text>
            <Text style={{ fontWeight: 900 }}>
              {number.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
            </Text>
          </Text>
          <TouchableOpacity onPress={() => setSendCode(false)}>
            <Text className="text-blue-600 text-xl font-medium ml-2 underline">
              Mudar o número
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {!sendCode && (
        <FormInput
          name="phone"
          label="Telefone"
          placeholder="(00) 00000-0000"
          control={control}
          rules={{ required: "Telefone é obrigatório" }}
          maskType="phone"
        />
      )}

      {sendCode && (
        <AppleOTPInput
          sendCode={(code) => {
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
            Enviar o código novamente
          </Text>
        </TouchableOpacity>
      )}

      {!sendCode && <Button title="Enviar" onPress={handleSubmit(onSubmit)} />}

      {/* {sendCode && <Button title="Enviar" onPress={handleSendCode} />} */}
    </KeyboardAvoidingView>
  );
}
