import { Keyboard, StyleSheet, Text, View } from "react-native";
import { usePasswordsForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { PasswordsSchema } from "@/lib/passwords._validation";
import { useRegisterAuthStore } from "@/store/register";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import LayoutRegister from "@/components/ui/LayoutRegister";

export default function InsertPassword() {
  const { control, handleSubmit } = usePasswordsForm();
  const { cpf } = useRegisterAuthStore();
  const { mutate, isPending } = useLoginMutation();

  const onSubmit = (data: PasswordsSchema) => {
    Keyboard.dismiss();
    mutate({ cpf: cpf ?? "", password: data.password! });
  };

  return (
    <LayoutRegister
      onContinue={handleSubmit(onSubmit)}
      isBack
      loading={isPending}
    >
      <View style={styles.content}>
        <Text className="text-center text-2xl">Informe sua senha</Text>

        <FormInput
          name="password"
          control={control}
          secureTextEntry
          label="Senha"
        />
      </View>
    </LayoutRegister>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // fundo preto inclusive no bottom
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#fff", // fundo preto no scroll
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
});
