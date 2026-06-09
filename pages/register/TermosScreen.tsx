import CreditProposalScreen from "@/components/CreditProposal";
import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { maskCpf, maskPhone } from "@/utils/mask";
import { FontAwesome } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LayoutRegister from "./layouts/layout-register";

import ButtonChat from "@/components/ui/ButtonChat";
import { useAuthStore } from "@/store/auth";
import { Etapas } from "@/utils";
import { router, useFocusEffect, useNavigation } from "expo-router";
import FinalScreenComponent from "./components/FinalScreenComponent";
import PulsingImageLoader from "./components/PulsingImageLoader";
import { useRegisterQuery } from "./query/useRegisterQuerys";

const TermosScreen: React.FC = () => {
  const { mutateAsync, isPending, isSuccess } = useRegisterQuery();
  const { setStep, data, token, hydrated, setData, setToken, setEtapa } =
    useRegisterStore();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [terms, setTerms] = useState("");
  const [accepted, setAccepted] = useState(false);
  const isLeaving = useRef(false);
  const hasLoadedTerms = useRef(false);
  const [isFinalized, setIsFinalized] = useState(false);
  console.log("termos", data?.etapa);

  const markAsFinalized = useCallback(() => {
    const currentData = useRegisterStore.getState().data;

    setEtapa(Etapas.FINALIZADO);

    if (currentData) {
      setData({
        ...currentData,
        etapa: Etapas.FINALIZADO,
      });
    }
  }, [setData, setEtapa]);

  const onBackPress = useCallback(() => {
    if (isLeaving.current) return true;
    isLeaving.current = true;
    setStep(8);
    router.replace("/(register)/step1");
    return true;
  }, [setStep]);

  const loadTerms = useCallback(async () => {
    if (hasLoadedTerms.current) return;
    if (terms.trim().length > 0) {
      hasLoadedTerms.current = true;
      return;
    }
    if (!hydrated || !token) return;

    setIsLoading(true);
    try {
      const response = await api.get("termos/Proposta_condicionada");
      const content = response?.data?.termo?.content || "";
      setTerms(content);
      hasLoadedTerms.current = true;
    } catch (error) {
      return error;
    } finally {
      setIsLoading(false);
    }
  }, [hydrated, terms, token]);

  useFocusEffect(
    useCallback(() => {
      loadTerms();

      const hardwareSub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      const beforeRemoveSub = navigation.addListener(
        "beforeRemove",
        (e: any) => {
          const actionType = e?.data?.action?.type;
          if (actionType !== "POP" && actionType !== "GO_BACK") return;
          if (isLeaving.current) return;
          e.preventDefault();
          onBackPress();
        },
      );

      return () => {
        hardwareSub.remove();
        beforeRemoveSub();
      };
    }, [loadTerms, navigation, onBackPress]),
  );

  const onSubmit = async () => {
    if (!accepted) {
      return;
    }

    if (data?.etapa === Etapas.FINALIZADO) {
      markAsFinalized();
      setIsFinalized(true);
      return;
    }

    try {
      await mutateAsync({
        request: {
          etapa: Etapas.FINALIZADO,
          flow: 1,
        },
      });
      markAsFinalized();
    } catch (error) {
      // markAsFinalized();
      // setIsFinalized(true);
      return error;
    }
  };

  const [loading, setLoading] = useState(false);
  const completeRegistration = async () => {
    setLoading(true);
    try {
      const response = await api.get("/v1/client");
      const dataClient =
        response.data?.data?.data || response.data?.data || response.data;
      if (dataClient?.type === "client") {
        const infoResponse = await api.get("/v1/client/data/info");
        const userData = infoResponse.data.data;
        const user = {
          nome: userData.name,
          email: userData.email,
          cpf: userData.cpf,
          cidade: userData.city,
          bairro: userData.neighborhood,
          status: userData.status,
          estado: userData.uf,
          endereco: userData.address,
          msg_painel: userData.msg_painel,
          msg_status: userData.msg_status,
          lastLoan: dataClient?.lastLoan,
          zip_code: userData.zip_code,
          phone: userData.phone,
          pix: userData.chave_pix ?? "",
          status_doc: userData.status_doc,
          isLoggedIn: true,
          observacoes: userData.observacoes,
          email_verificado: userData.email_verificado,
          phone_verificado: userData.phone_verificado,
        };
        const token = useRegisterStore.getState().token || "";
        await useAuthStore.getState().login(token, user);
        router.replace("/(tabs)/home");
      } else {
        const status = dataClient?.status;
        const routeByStatus: Record<string, any> = {
          divergente: "/divergencia_screen",
          recusado: "/recusado_screen",
          aprovado: "/pre_aprovado_screen",
          "pre-aprovado": "/pre_aprovado_screen",
          analise: "/analise_screen",
          reanalise: "/reanalise_screen",
          "proposta-expirada": "/divergencia_screen",
        };

        setData({
          ...dataClient,
          primeira_analise: response.data?.data?.data?.primeira_analise ?? 0,
        });
        setToken(useRegisterStore.getState().token || "");

        const targetRoute =
          status && routeByStatus[status] ? routeByStatus[status] : null;

        if (targetRoute) {
          router.replace(targetRoute);
        } else {
          useRegisterStore.getState().clean();
          router.replace("/login");
        }
      }
    } catch (error) {
      useRegisterStore.getState().clean();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading || (isLoading && terms.trim().length === 0) || isPending) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text={
          loading
            ? "Carregando..."
            : isLoading
              ? "Carregando termos..."
              : "Aguarde..."
        }
      />
    );
  }

  if (isSuccess || isFinalized) {
    return <FinalScreenComponent complete={completeRegistration} />;
  }

  return (
    <>
      <LayoutRegister
        title="Quase Lá!"
        subtitle="Para finalizar, confira os detalhes e aceite o contrato"
        showBackButton
        onBack={onBackPress}
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
          <Text style={styles.propostaText}>
            CPF: {maskCpf(data?.cpf || "")}
          </Text>
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
      <ButtonChat />
    </>
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
