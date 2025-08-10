import {  Image, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { usePasswordsForm } from "@/hooks/useRegisterForm";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { PasswordsSchema } from "@/lib/passwords._validation";
import { useRegisterAuthStore } from "@/store/register";
import { useRegisterDataMutation } from "@/hooks/useRegisterMutation";
import Spinner from "@/components/Spinner";

export default function CreatePassword() {
  const { control, handleSubmit } = usePasswordsForm();
  const { phone, cpf } = useRegisterAuthStore();
  const { mutate, isPending } = useRegisterDataMutation();

  const onSubmit = (data: PasswordsSchema) => {
    Keyboard.dismiss()
    mutate({cpf: cpf ?? '',phone: phone ?? '' ,password:data.password!})
  };

  
  return (
   <SafeAreaView style={styles.safeArea}>
    {isPending && <Spinner />}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Image
                source={require("@/assets/images/apenas-logo.png")}
                className="w-full h-56 mb-4"
                resizeMode="contain"
              />

              <FormInput
                name="password"
                control={control}
                secureTextEntry
                label="Senha"
              />
              <FormInput
                name="confirmPassword"
                control={control}
                secureTextEntry
                label="Confirme a senha"
              />

              <Button title="Prosseguir" onPress={handleSubmit(onSubmit)} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    
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
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
 
});
