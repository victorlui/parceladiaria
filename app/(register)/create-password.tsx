import {
  Image,
  Keyboard,
  Text,
  TextInput,
  View,
} from "react-native";
import { usePasswordsForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { PasswordsSchema } from "@/lib/passwords._validation";
import { useRegisterAuthStore } from "@/store/register";
import { useRegisterDataMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useRef } from "react";
import { FontAwesome6 } from "@expo/vector-icons";

export default function CreatePassword() {
  const { control, handleSubmit } = usePasswordsForm();
  const { phone, cpf, setPassword } = useRegisterAuthStore();
  const { mutate, isPending } = useRegisterDataMutation();
  const formRefs = [useRef<TextInput>(null), useRef<TextInput>(null)];

  const onSubmit = (data: PasswordsSchema) => {
    Keyboard.dismiss();
    setPassword(data.password || "");
    mutate({ cpf: cpf ?? "", phone: phone ?? "", password: data.password! });
  };

  return (
    <LayoutRegister
      onContinue={handleSubmit(onSubmit)}
      loading={isPending}
      isBack
      isLogo={false}
    >
      <View className="flex-1 px-6">
        <View className="items-center mb-6">
          <Image
            source={require("@/assets/images/apenas-logo.png")}
            className="w-full h-40"
            resizeMode="contain"
          />
        </View>

        <View className="items-center mb-6">
          <View className="bg-[#9BD13D] p-4 rounded-2xl shadow-md">
            <FontAwesome6 name="lock" size={40} color="white" />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-gray-700 text-center text-2xl font-bold">
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
      </View>
    </LayoutRegister>
  );
}
