import ButtonComponent from "@/shared/components/Button";
import InputComponent from "@/shared/components/Input";
import Layout from "@/shared/components/Layout";
import { Colors } from "@/shared/constants/colors";
import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";

export default function cpf() {
  const cpfRef = useRef<TextInput>(null);
  const [cpf, setCpf] = useState("");
  return (
    <Layout>
      <View style={styles.container}>
        <Image
          source={require("../../../assets/images/logo-verde.png")}
          resizeMode="cover"
          style={styles.logo}
        />
        <View>
          <Text style={styles.title}>Parcela Diária</Text>
          <Text style={styles.subtitle}>Insira seu CPF para continuar</Text>
        </View>

        <InputComponent
          ref={cpfRef}
          placeholder="Seu CPF"
          keyboardType="numeric"
          maxLength={11}
          value={cpf}
          maskType="cpf"
          icon={
            <FontAwesome name="vcard" size={20} color={Colors.gray.primary} />
          }
          onChangeText={setCpf}
          returnKeyType="send"
        />

        <ButtonComponent
          title="Acessar"
          onPress={() => console.log(cpf)}
          loading={true}
          iconLeft={null}
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
