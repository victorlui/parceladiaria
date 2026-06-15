import { AnalyticsService } from "@/analytics/analytics.service";
import {
  ANALYTICS_FLOWS,
  REGISTER_ANALYTICS_SOURCES,
  REGISTER_SCREENS,
} from "@/analytics/events";
import CreditProposalScreen from "@/components/CreditProposal";
import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import api, { withAnalytics } from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { maskCpf, maskPhone } from "@/utils/mask";
import React, { useCallback, useRef, useState } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import LayoutRegister from "./layouts/layout-register";

import ButtonChat from "@/components/ui/ButtonChat";
import { useAuthStore } from "@/store/auth";
import { Etapas } from "@/utils";
import { router, useFocusEffect, useNavigation } from "expo-router";
import CheckboxTerms from "./components/CheckboxTerms";
import FinalScreenComponent from "./components/FinalScreenComponent";
import PulsingImageLoader from "./components/PulsingImageLoader";
import { useRegisterQuery } from "./query/useRegisterQuerys";

const TermosScreen: React.FC = () => {
  const { isPending, isSuccess } = useRegisterQuery();
  const { setStep, data, token, hydrated, setData, setToken, etapa, step } =
    useRegisterStore();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [terms, setTerms] = useState("");
  const [scrConsulta, setScrConsulta] = useState("");
  const [scrCompartilhamento, setScrCompartilhamento] = useState("");
  const [allAccepted, setAllAccepted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptedConsult, setAcceptedConsult] = useState(false);
  const [acceptedShare, setAcceptedShare] = useState(false);

  const isLeaving = useRef(false);
  const hasLoadedTerms = useRef(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [loading, setLoading] = useState(false);
  const isAlreadyFinalized = (data?.etapa ?? etapa) === Etapas.FINALIZADO;

  React.useEffect(() => {
    AnalyticsService.screen(REGISTER_SCREENS.TERMS, {
      flow: ANALYTICS_FLOWS.REGISTER,
      register_step: step,
      etapa: data?.etapa ?? etapa,
    });
  }, [data?.etapa, etapa, step]);

  const onBackPress = useCallback(() => {
    if (isLeaving.current) return true;
    isLeaving.current = true;
    setStep(8);
    router.replace("/(register)/step1");
    return true;
  }, [setStep]);

  const loadTerms = useCallback(async () => {
    if (hasLoadedTerms.current) return;
    if (isAlreadyFinalized) return;
    if (terms.trim().length > 0) {
      hasLoadedTerms.current = true;
      return;
    }
    if (!hydrated || !token) return;

    setIsLoading(true);
    try {
      const response = await api.get(
        "termos/Proposta_condicionada",
        withAnalytics({
          flow: ANALYTICS_FLOWS.REGISTER,
          source: REGISTER_ANALYTICS_SOURCES.TERMS_LOAD,
          register_step: step,
        }),
      );
      const content = response?.data?.termo?.content || "";
      const { data: scrConsultaResponse } = await api.get(
        "/termos/SCR_consulta",
      );
      const { data: scrCompartilhamentoResponse } = await api.get(
        "/termos/SCR_compartilhamento",
      );
      setScrConsulta(scrConsultaResponse?.termo.content || "");
      setScrCompartilhamento(scrCompartilhamentoResponse?.termo.content || "");
      setTerms(content);
      hasLoadedTerms.current = true;
    } catch (error) {
      return error;
    } finally {
      setIsLoading(false);
    }
  }, [hydrated, isAlreadyFinalized, terms, token]);

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
    setIsLoading(true);
    try {
      await api.post("/v1/client/scr-consent", {
        consulta: acceptedConsult,
        compartilhamento: acceptedShare,
      });
      setIsFinalized(true);
    } catch (error) {
      return error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    setLoading(true);
    try {
      await api.put(
        "/v1/client/update",
        {
          etapa: Etapas.FINALIZADO,
          flow: 1,
        },
        withAnalytics({
          flow: ANALYTICS_FLOWS.REGISTER,
          source: REGISTER_ANALYTICS_SOURCES.TERMS_COMPLETE_UPDATE,
          register_step: step,
        }),
      );
      const response = await api.get(
        "/v1/client",
        withAnalytics({
          flow: ANALYTICS_FLOWS.REGISTER,
          source: REGISTER_ANALYTICS_SOURCES.TERMS_COMPLETE_CLIENT,
          register_step: step,
        }),
      );
      const dataClient =
        response.data?.data?.data || response.data?.data || response.data;

      if (dataClient?.type === "client") {
        const infoResponse = await api.get(
          "/v1/client/data/info",
          withAnalytics({
            flow: ANALYTICS_FLOWS.REGISTER,
            source: REGISTER_ANALYTICS_SOURCES.TERMS_COMPLETE_CLIENT_INFO,
            register_step: step,
          }),
        );
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

  if (isSuccess || isFinalized || isAlreadyFinalized) {
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

        <CheckboxTerms
          accepted={accepted}
          setAccepted={() => {
            setAccepted(!accepted);
            setAcceptedConsult(!acceptedConsult);
            setAcceptedShare(!acceptedShare);
          }}
          content="Li e concordo com as condições acima."
          link={true}
        />
        <CheckboxTerms
          accepted={acceptedConsult}
          setAccepted={setAcceptedConsult}
          content={scrConsulta}
          showReadMore={true}
        />

        <CheckboxTerms
          accepted={acceptedShare}
          setAccepted={setAcceptedShare}
          content={scrCompartilhamento}
          showReadMore={true}
        />

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
