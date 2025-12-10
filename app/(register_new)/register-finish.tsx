import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import { useRegisterAuthStore } from "@/store/register";
import { useRegisterNewStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LoadingScreen = (text: string) => (
  <View style={styles.loadingContainer}>
    <View style={styles.spinnerWrapper}>
      <ActivityIndicator size={140} color={Colors.green.primary} />
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.spinnerLogo}
        resizeMode="contain"
      />
    </View>

    <Text style={styles.loadingText}>{text}</Text>
  </View>
);

const RegisterFinish: React.FC = () => {
  const { data } = useRegisterNewStore();
  const { cpf, password } = useRegisterAuthStore();
  const {
    mutate,
    isPending: isRegistering,
    isError,
    error,
    isSuccess: isRegisterSuccess,
  } = useUpdateUserMutation();
  const { mutate: loginMutate, isPending: isLoggingIn } = useLoginMutation();
  const [accepted, setAccepted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (isError) {
        Alert.alert(
          "Erro",
          error?.message || "Ocorreu um erro ao finalizar o cadastro."
        );
      }
    }, [isError])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (isRegisterSuccess) {
        setIsSuccess(true);
      }
    }, [isRegisterSuccess])
  );

  const completeRegistration = () => {
    const userCpf = cpf ?? "";
    const userPassword = password ?? data?.password ?? "";

    if (!userCpf || !userPassword) {
      Alert.alert("Erro", "Não foi possível realizar o login automático.");
      return;
    }
    loginMutate({ cpf: userCpf, password: userPassword });
  };

  const onSubmit = async () => {
    if (!accepted) return;

    try {
      mutate({
        request: {
          etapa: Etapas.FINALIZADO,
          termos: 1,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  if (isRegistering) {
    return LoadingScreen("Aguarde, estamos processando seu cadastro...");
  }

  if (isLoggingIn) {
    return LoadingScreen("Entrando...");
  }

  if (isSuccess) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View style={styles.successContainer}>
          <FontAwesome
            name="check-circle"
            size={100}
            color={Colors.green.secondary}
          />
          <Text style={styles.successTitle}>Cadastro Concluído</Text>
          <Text style={styles.successText}>
            Seu cadastro foi enviado com sucesso. Em breve entraremos em contato
          </Text>
        </View>
        <View style={{ marginVertical: 15, width: "100%" }}>
          <ButtonComponent
            title="Entrar"
            iconLeft="home"
            iconRight={null}
            onPress={completeRegistration}
          />
        </View>
      </View>
    );
  }

  return (
    <LayoutRegister
      title="Quase lá!"
      subtitle="Para finalizar, confira os detalhes e aceite o contrato"
    >
      <ScrollView style={styles.card_termos}>
        <Text style={styles.text_strong}>DETALHES DO CONTRATO</Text>
        <Text style={styles.text_content}>
          Valor do Contrato: <Text style={styles.text_strong}>R$ 600,00</Text>
          {"\n"}
          IOF (0,63%): - <Text style={styles.text_strong}>R$ 3,78</Text>
          {"\n"}
          Taxa T.I.C. (1,68%): -{" "}
          <Text style={styles.text_strong}>R$ 10,08</Text>
          {"\n"}
          Valor a Receber: <Text style={styles.text_strong}>R$ 586,14</Text>
        </Text>

        <Text style={styles.text_strong}>PAGAMENTOS</Text>
        <Text style={styles.text_content}>
          Lembrando, os pagamentos são diários de segunda à sábado (incluindo
          feriados), exceto aos domingos. O pagamento deve ser realizado até as
          23hs, horário de Brasília. O pagamento das suas parcelas deverá ser
          realizado apenas pelo nosso site na área de clientes.
        </Text>

        <Text style={styles.text_strong}>PENALIDADES POR ATRASO</Text>
        <Text style={styles.text_content}>
          Em casos de atrasos no pagamento, ocorrerá uma renegociação automática
          de sua dívida conforme acordado em contrato. Esta penalidade acontece
          a cada 2 (dois) atrasos. O valor acrescentado será de 5% sobre o valor
          total financiado. O valor da penalidade será lançado em forma de uma
          parcela extra em seu contrato, tendo a data de pagamento para um dia
          após a sua última parcela lançada.
        </Text>

        <Text style={styles.text_strong}>RENOVAÇÕES</Text>
        <Text style={styles.text_content}>
          O aumento de limite é progressivo de R$300,00 em R$300,00 a cada
          renovação, podendo chegar até o valor máximo de R$1.500,00. Para
          renovar o seu empréstimo você deve atender as condições, que estão
          disponíveis na sua área do cliente, em nosso site.
        </Text>
      </ScrollView>
      <TouchableOpacity
        onPress={() => setAccepted((prev) => !prev)}
        style={styles.checkboxRow}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
          {accepted && (
            <FontAwesome name="check" size={14} color={Colors.white} />
          )}
        </View>
        <Text style={styles.checkboxText}>
          Li e concordo com as condições acima.
        </Text>
      </TouchableOpacity>
      <ButtonComponent
        iconLeft={null}
        iconRight={"checkmark"}
        title="Finalizar Cadastro"
        onPress={onSubmit}
        disabled={!accepted}
      />
    </LayoutRegister>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  spinnerWrapper: {
    width: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerLogo: {
    position: "absolute",
    width: 160,
    height: 160,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    width: 250,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.green.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.green.primary,
  },
  checkboxText: {
    color: Colors.black,
    fontSize: 14,
  },
  termsLink: {
    color: Colors.green.primary,
    fontWeight: "bold",
  },
  card_termos: {
    backgroundColor: "#F0F3F5",
    padding: 10,
    borderRadius: 12,
  },
  text_strong: {
    color: Colors.green.text,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  text_content: {
    fontSize: 14,
    marginBottom: 5,
    color: Colors.black,
  },
  successContainer: {
    alignItems: "center",
    gap: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.gray.primary,
    textAlign: "center",
  },
});

export default RegisterFinish;
