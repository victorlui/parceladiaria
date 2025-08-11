import LayoutRegister from "@/components/ui/LayoutRegister";
import { Text, View } from "react-native";
import { useEmailForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { EmailSchema } from "@/lib/email_validation";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";

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
      onContinue={handleSubmit(onSubmit)}
      loading={isPending}
    >
      <View className="flex-1">
        <Text className="text-2xl text-center mb-8">Insira seu email</Text>

        <View className="flex-1">
          <FormInput
            control={control}
            label="E-mail"
            name="email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>
    </LayoutRegister>
  );
}
