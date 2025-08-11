
import { useState } from "react";
import { Keyboard, Text, TouchableOpacity, View,Alert } from "react-native"
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
import Phone from "@/assets/images/phone_img.svg";

export default function PhoneScreen() {
  const { control, handleSubmit, getValues } = usePhoneForm();
  const { mutate, isPending, data } = useRegisterMutation();
  const { setPhone } = useRegisterAuthStore();
  const mutation = useCheckOTPMutation();
  const [sendCode, setSendCode] = useState(false);
  const [code, setCode] = useState("");

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
    <LayoutRegister
      onContinue={
        !sendCode
          ? handleSubmit(onSubmit)
          : code
            ? () => handleSendCode(code)
            : () => Alert.alert("Por favor, insira o código de verificação")

      }
      isBack={true}
      loading={isPending}
      isLogo={false}
    >
      <View className="flex items-center justify-center">
        <Phone width={250} height={250} />

        {/* <CircleIcon icon={<WhatsappIcon width={60} height={60} />}  color={Colors.primaryColor}
          size={100} /> */}
      </View>

      <View className="flex-1 justify-center">
        {!sendCode && (
          <Text className="text-gray-700 text-xl text-center mb-5 ">
            Por favor, insira seu número de telefone (WhatsApp) para receber um
            código de verificação.
          </Text>
        )}
        {sendCode && (
          <View className="flex-row flex-wrap items-center justify-center  mb-5">
            <Text className="my-5 text-center">
              <Text className=" text-gray-700 text-xl">
                Um código de 6 digitos foi enviado para o número{" "}
              </Text>
              <Text style={{ fontWeight: 900 }}>
                {number.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
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
              Enviar o código novamente
            </Text>
          </TouchableOpacity>
        )}

        {/* {!sendCode && (
          <Button title="Enviar" onPress={handleSubmit(onSubmit)} />
        )} */}

        {/* {sendCode && <Button title="Enviar" onPress={handleSendCode} />} */}
      </View>
    </LayoutRegister>
  );
}
