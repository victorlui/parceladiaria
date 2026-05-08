import CreditProposalScreen from "@/components/CreditProposal";
import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import LayoutRegister from "@/layouts/layout-register";
import api from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { maskCpf, maskPhone } from "@/utils/mask";
import { FontAwesome } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PulsingImageLoader from "./components/PulsingImageLoader";
import FinalScreenComponent from "./components/FinalScreenComponent";
import { useRegisterQuery } from "./query/useRegisterQuerys";
import { Etapas } from "@/utils";
import { router, useFocusEffect } from "expo-router";

const TermosScreen: React.FC = () => {
  const { mutate, isPending, isSuccess } = useRegisterQuery();
  const { step, setStep, clean } = useRegisterStore();
  const { data } = useRegisterStore();
  const [isLoading, setIsLoading] = useState(false);
  const [terms, setTerms] = useState("");
  const [accepted, setAccepted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(register)/step1");
        setStep(7);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [step]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const getTerms = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get("termos/Proposta_condicionada");

        setTerms(data.termo.content || "");
      } catch (error) {
        console.log("error", error);
      } finally {
        setIsLoading(false);
      }
    };
    getTerms();
  }, []);

  const onSubmit = async () => {
    if (!accepted) {
      return;
    }

    try {
      mutate({
        request: {
          etapa: Etapas.FINALIZADO,
          flow: 1,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const completeRegistration = () => {
    clean();
    router.replace("/login");
  };

  if (isLoading || isPending) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text={isLoading ? "Carregando termos..." : "Aguarde..."}
      />
    );
  }

  if (isSuccess) {
    return <FinalScreenComponent complete={completeRegistration} />;
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
          {data?.nome
            ?.split(" ")
            .map((part, index) =>
              index === 0 ? part : part.charAt(0).toUpperCase() + ".",
            )
            .join(" ")}
        </Text>
        <Text style={styles.propostaText}>CPF: {maskCpf(data?.cpf || "")}</Text>
        <Text style={styles.propostaText}>
          Telefone: {maskPhone(data?.phone || data?.whatsapp || "")}
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

export default TermosScreen;
