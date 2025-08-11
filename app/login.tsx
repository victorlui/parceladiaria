import { FormInput } from "@/components/FormInput";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useCPFForm } from "@/hooks/useLoginForm";
import { useCheckCPFMutation } from "@/hooks/useLoginMutation";
import { CPFSchema } from "@/lib/cpf_validation";
import { useRegisterAuthStore } from "@/store/register";
import { Image, Keyboard, Text, View } from "react-native";
import CPF from "../assets/images/cpf_img.svg";

export default function LoginScreen() {
  const { handleSubmit, control } = useCPFForm();
  const mutation = useCheckCPFMutation();
  const { setCpf } = useRegisterAuthStore();

  const onSubmit = (data: CPFSchema) => {
    Keyboard.dismiss();
    setCpf(data.cpf);
    mutation.mutate(data);
  };

  return (
    <LayoutRegister
      onContinue={handleSubmit(onSubmit)}
      isLogo={false}
      loading={mutation.isPending}
    >
      <View className=" mb-10">
            <Image
              source={require("@/assets/images/apenas-logo.png")}
              className="w-full h-60 mb-8"
              resizeMode="contain"
            />
            <Text className="text-4xl text-center  font-bold">
              PARCELA DIÁRIA
            </Text>
          </View>
      <View className="flex-1 justify-center">
        <View>
          {/* <View className="flex items-center">
          <CPF width={250} height={250} />
        </View> */}
          
          <Text className="text-4xl  font-bold">Bem vindo de volta!</Text>
          <Text className="text-base  text-[#33404F] mb-8">
            Informe seu CPF para continuar
          </Text>
        </View>
        <FormInput
          control={control}
          name="cpf"
          placeholder="000.000.000-00"
          keyboardType="numeric"
          rules={{ required: "CPF é obrigatório" }}
          maskType="cpf"
          returnKeyType="done"
          onSubmitEditing={handleSubmit(onSubmit)}
        />
      </View>
    </LayoutRegister>
  );
}
