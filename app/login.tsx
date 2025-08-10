import { FormInput } from "@/components/FormInput";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useCPFForm } from "@/hooks/useLoginForm";
import { useCheckCPFMutation } from "@/hooks/useLoginMutation";
import { CPFSchema } from "@/lib/cpf_validation";
import { useRegisterAuthStore } from "@/store/register";
import { Keyboard, Text, View } from "react-native";

export default function LoginScreen() {
  const {
    handleSubmit,
    control,
  } = useCPFForm();
  const mutation = useCheckCPFMutation();
  const {setCpf} = useRegisterAuthStore()


  const onSubmit = (data: CPFSchema) => {
    Keyboard.dismiss()
    setCpf(data.cpf)
    mutation.mutate(data);  
  };

  return (
    <LayoutRegister onContinue={handleSubmit(onSubmit)} loading={mutation.isPending}>
      
     
      <View className="flex-1 justify-center">
        
        <Text className="text-xl font-bold mb-4  ">Informe seu CPF</Text>

        <FormInput
          control={control}
          name="cpf"
          placeholder="000.000.000-00"
          keyboardType="numeric"
          rules={{ required: "CPF é obrigatório" }}
          maskType="cpf"
          
        />
      </View>

    </LayoutRegister>
  );
}
