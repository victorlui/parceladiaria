import { FormInput } from "@/components/FormInput";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useCPFForm } from "@/hooks/useLoginForm";
import { useCheckCPFMutation } from "@/hooks/useLoginMutation";
import { CPFSchema } from "@/lib/cpf_validation";
import { useRegisterAuthStore } from "@/store/register";
import { Image, Keyboard, Text, View } from "react-native";
import { useAlerts } from "@/components/useAlert";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
export default function LoginScreen() {
  const { handleSubmit, control } = useCPFForm();
  const { AlertDisplay } = useAlerts();
  const mutation = useCheckCPFMutation();
  const { setCpf } = useRegisterAuthStore();

  const onSubmit = (data: CPFSchema) => {
    Keyboard.dismiss();
    setCpf(data.cpf);
    mutation.mutate(data);
  };

  return (
    <>
      <AlertDisplay />

      <LayoutRegister
        onContinue={handleSubmit(onSubmit)}
        isLogo={false}
        loading={mutation.isPending}
      >
        <View className="flex-1  px-6 py-8">
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/apenas-logo.png")}
              className="w-full h-48"
              resizeMode="contain"
            />
          </View>

        
          <View className="items-center mb-8">
            <View className="bg-[#9BD13D] p-4 rounded-2xl shadow-md">
              <FontAwesome6 name="lock" size={40} color="white" />
            </View>
          </View>

          {/* Welcome Text Section */}
          <View className="mb-10 ">
            <Text className="text-4xl text-center font-bold text-[#33404F]">
              Bem-vindo
            </Text>
            <Text className="text-lg text-center text-[#4B5563]">
              Digite seu CPF para continuar
            </Text>
          </View>

          {/* Input Section */}
          <View className="w-full">
            <FormInput
              control={control}
              name="cpf"
              
              placeholder="000.000.000-00"
              keyboardType="numeric"
              rules={{ required: "CPF é obrigatório" }}
              maskType="cpf"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              icon={<FontAwesome name="id-card" size={24} color="#9CA3AF" />}
              
            />
          </View>
        </View>
      </LayoutRegister>
    </>
  );
}
