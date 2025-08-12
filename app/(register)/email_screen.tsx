import LayoutRegister from "@/components/ui/LayoutRegister";
import { Image, Text, View } from "react-native";
import { useEmailForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { EmailSchema } from "@/lib/email_validation";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EmailScreen() {
  const { control, handleSubmit } = useEmailForm();

  const { mutate, isPending } = useUpdateUserMutation();

  const onSubmit = (data: EmailSchema) => {
    console.log("email", data);
    const request = {
      email: data.email,
      etapa: Etapas.REGISTRANDO_ENDERECO,
    };

    mutate({ request: request });
  };

  return (
    <LayoutRegister
      isBack
      isLogo={false}
      onContinue={handleSubmit(onSubmit)}
      loading={isPending}
    >
      <View className="flex-1 justify-between px-6">
        <View className="items-center mb-8 ">
          <Image
            source={require("@/assets/images/apenas-logo.png")}
            className="w-full h-48"
            resizeMode="contain"
          />
        </View>
        <View className="items-center ">
          <View className="bg-[#9BD13D] p-4 rounded-2xl shadow-md">
            <MaterialCommunityIcons name="email" size={40} color="white" />
          </View>
        </View>
        <View className="flex-1 my-10">
          <Text className="text-2xl text-center  font-bold">
            Insira seu email
          </Text>
          <View className="flex-1 justify-center">
            <FormInput
              control={control}
              label="E-mail"
              name="email"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}


            />
          </View>
        </View>
      </View>
    </LayoutRegister>
  );
}
