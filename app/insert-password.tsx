import { Image, Keyboard, StyleSheet, Text, View } from "react-native";
import { usePasswordsLoginForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { useRegisterAuthStore } from "@/store/register";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import LayoutRegister from "@/components/ui/LayoutRegister";
import { useAlerts } from "@/components/useAlert";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect } from "react";
import { PasswordLoginSchema } from "@/lib/password_validation";

export default function InsertPassword() {
  const { AlertDisplay,showError,showWarning } = useAlerts();
  const { control, handleSubmit } = usePasswordsLoginForm();

  const { cpf, setPassword } = useRegisterAuthStore();
  const { mutate, isPending,isError } = useLoginMutation();

  useEffect(() => {
    if (isError) {
      showError("Acesso negado","");
    }
  }, [isError]); // eslint-disable-line react-hooks/exhaustive-deps



  const onSubmit = (data: PasswordLoginSchema) => {
    if (!data.password) {
      showWarning("Atenção","Por favor, insira sua senha.");
      return;
    }
    Keyboard.dismiss();
    setPassword(data.password || "");
    mutate({ cpf: cpf ?? "", password: data.password! });
  };

  return (
    <>
      <AlertDisplay />
      <LayoutRegister
        onContinue={handleSubmit(onSubmit)}
        isBack
        isLogo={false}
        loading={isPending}
      >
        <View className="flex-1 justify-between px-6">
          <View className="items-center mb-8">
            <Image
              source={require("@/assets/images/apenas-logo.png")}
              className="w-full h-48"
              resizeMode="contain"
            />
          </View>

          <View className="items-center ">
            <View className="bg-[#9BD13D] p-4 rounded-2xl shadow-md">
              <FontAwesome6 name="lock" size={40} color="white" />
            </View>
          </View>
          <View className="flex justify-center flex-1">
          <Text className="text-gray-700 text-center text-2xl font-bold  ">
            Senha de acesso
          </Text>
        </View>
          <View style={styles.content}>
            <FormInput
              name="password"
              control={control}
              secureTextEntry
              label="Senha"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </LayoutRegister>
    </>
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
    
  },
});
