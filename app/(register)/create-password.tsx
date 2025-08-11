import { Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import { usePasswordsForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { PasswordsSchema } from "@/lib/passwords._validation";
import { useRegisterAuthStore } from "@/store/register";
import { useRegisterDataMutation } from "@/hooks/useRegisterMutation";
import PasswordIMG from "@/assets/images/password_img.svg";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useRef } from "react";

export default function CreatePassword() {
  const { control, handleSubmit } = usePasswordsForm();
  const { phone, cpf } = useRegisterAuthStore();
  const { mutate, isPending } = useRegisterDataMutation();
  const formRefs = [useRef<TextInput>(null), useRef<TextInput>(null)];

  const onSubmit = (data: PasswordsSchema) => {
    Keyboard.dismiss();
    mutate({ cpf: cpf ?? "", phone: phone ?? "", password: data.password! });
  };

  return (
    <LayoutRegister
      onContinue={handleSubmit(onSubmit)}
      loading={isPending}
      isBack
      isLogo={false}
    >
      <View className="flex items-center justify-center">
        <PasswordIMG width={250} height={250} />
      </View>

      <View className="flex justify-center  flex-1">
        <Text className="text-gray-700 text-2xl font-bold  ">
          Crie sua senha de acesso
        </Text>
      </View>

      <View className="flex-1">
        <FormInput
          name="password"
          control={control}
          secureTextEntry
          label="Senha"
          onSubmitEditing={() => formRefs[1].current?.focus()}
          ref={formRefs[0]}
        />
        <FormInput
          name="confirmPassword"
          control={control}
          secureTextEntry
          label="Confirme a senha"
          onSubmitEditing={handleSubmit(onSubmit)}
          ref={formRefs[1]}
        />
      </View>
    </LayoutRegister>
  );
}
