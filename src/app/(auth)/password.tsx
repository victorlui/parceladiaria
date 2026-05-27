import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";
import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import Layout from "@/shared/components/Layout";
import { Colors } from "@/shared/constants/colors";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

export default function Password() {
  const { loginMutation } = useLoginMutation();
  const { showAlert } = useAlertStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const senhaRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!password) {
      showAlert("warning", "Atenção!!", "Senha obrigatórias");
      senhaRef.current?.focus();
      return;
    }
    loginMutation.mutate({ password });
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Image
          source={require("../../../assets/images/logo-verde.png")}
          resizeMode="cover"
          style={styles.logo}
        />
        <View>
          <Text style={styles.title}>Senha de acesso</Text>
          <Text style={styles.subtitle}>
            {" "}
            Digite sua senha para acessar sua conta
          </Text>
        </View>

        <InputComponent
          ref={senhaRef}
          placeholder="Senha"
          secureTextEntry={!showPassword}
          value={password}
          icon={
            <FontAwesome name="lock" size={22} color={Colors.gray.primary} />
          }
          rightIcon={
            <FontAwesome
              name={showPassword ? "eye-slash" : "eye"}
              size={22}
              color={Colors.gray.primary}
              onPress={() => {
                setShowPassword(!showPassword);
              }}
            />
          }
          onChangeText={setPassword}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <ButtonComponent
          title="Acessar"
          onPress={handleLogin}
          iconLeft={null}
          disabled={loginMutation.isPending}
          loading={loginMutation.isPending}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  logo: {
    height: 100,
    width: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.green.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.primary,
    textAlign: "center",
    marginBottom: 24,
  },
});
