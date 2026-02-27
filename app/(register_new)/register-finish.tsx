import CreditProposalScreen from "@/components/CreditProposal";
import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import LayoutRegister from "@/layouts/layout-register";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterAuthStore } from "@/store/register";
import { useRegisterNewStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
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

const maskCpf = (cpf: string | undefined) => {
  if (!cpf) return "";
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return cpf;
  return `***.***.${cleanCpf.slice(6, 9)}-**`;
};

const maskPhone = (phone: string | undefined) => {
  if (!phone) return "";
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 4) return phone;
  const last4 = cleanPhone.slice(-4);
  return `(**) *****-${last4}`;
};

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
  const { userRegister, user } = useAuthStore();
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
  const [terms, setTerms] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      if (isError) {
        Alert.alert(
          "Erro",
          error?.message || "Ocorreu um erro ao finalizar o cadastro.",
        );
      }
    }, [isError]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (isRegisterSuccess) {
        setIsSuccess(true);
      }
    }, [isRegisterSuccess]),
  );

  useEffect(() => {
    const getTerms = async () => {
      try {
        const { data } = await api.get("termos/Proposta_condicionada");

        setTerms(data.termo.content || "");
      } catch (error) {
        console.log("error", error);
      }
    };
    getTerms();
  }, []);

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
      title="Quase Lá!"
      subtitle="Para finalizar, confira os detalhes e aceite o contrato"
    >
      <View style={styles.propostaContainer}>
        <Text style={[styles.propostaTitle, { marginBottom: 0 }]}>
          Proposta para
        </Text>
        <Text style={styles.propostaTitle}>
          {(user?.nome || userRegister?.nome)
            ?.split(" ")
            .map((part, index) =>
              index === 0 ? part : part.charAt(0).toUpperCase() + ".",
            )
            .join(" ")}
        </Text>
        <Text style={styles.propostaText}>
          CPF: {maskCpf(data?.cpf! ?? userRegister?.cpf ?? "")}
        </Text>
        <Text style={styles.propostaText}>
          Telefone: {maskPhone(data?.phone! ?? userRegister?.whatsapp ?? "")}
        </Text>
      </View>
      <View style={{ marginHorizontal: 25, width: "100%" }}>
        <CreditProposalScreen terms={terms} />
      </View>
      <TouchableOpacity
        onPress={() => setAccepted((prev) => !prev)}
        style={styles.checkboxRow}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
          {accepted && (
            <FontAwesome name="check" size={14} color={Colors.white} />
          )}
        </View>
        <View>
          <Text style={styles.checkboxText}>
            Li e concordo com as condições acima.
          </Text>
          <Text style={styles.termsLink}>26x R$ 30,30 por dia</Text>
        </View>
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
    padding: 10,
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
  propostaContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    width: "100%",
  },
  propostaTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.green.primary,
  },
  propostaText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
});

export default RegisterFinish;
