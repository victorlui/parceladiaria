import ChamadaVideoScreen from "@/components/pre_aprovado/chamada_video_screen";
import TermsFinalScreen from "@/components/pre_aprovado/terms_final_screen";
import { useAlerts } from "@/components/useAlert";
import { useCheckStatus } from "@/hooks/useCheckStatus";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { convertData } from "@/utils";
import { tratarEstado } from "@/utils/validation";
import * as Network from "expo-network";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PreAprovado: React.FC = () => {
  const { redirectPath } = useCheckStatus("/pre_aprovado_screen");
  const { data: registerData, clean } = useRegisterStore();
  const [loadingAccept, setLoadingAccept] = useState(false);
  const { showSuccess, showError, AlertDisplay } = useAlerts();
  if (redirectPath) {
    return <Redirect href={redirectPath as any} />;
  }

  const acceptTerms = async () => {
    setLoadingAccept(true);
    try {
      const ip = await Network.getIpAddressAsync();
      const city = registerData?.cidade?.trim();
      const rawState = registerData?.estado?.trim();
      const state = rawState ? tratarEstado(rawState) : "";

      if (!ip || !city || !rawState || state === "Estado Inválido") {
        showError(
          "Atenção",
          "Não foi possível aceitar os termos porque faltam cidade, estado ou IP. Faça login novamente para atualizar seus dados.",
          false,
          async () => {
            clean();
            await useAuthStore.getState().logout();
            router.replace("/login");
          },
        );
        return;
      }

      const payload = {
        sign_info_date: convertData(),
        sign_info_ip_address: ip,
        sign_info_city: city,
        sign_info_state: state,
        sign_info_country: "BR",
      };

      await api.post("v1/client/acept-term", payload);
      showSuccess(
        "Concluido!",
        "Termos aceitos com sucesso! Você será redirecionado para a página de login para finalizar o processo.",
        () => {
          clean();
          router.replace("/login");
        },
      );
      // const response = await api.get("/v1/client");
      // const dataClient =
      //   response.data?.data?.data || response.data?.data || response.data;
      // console.log("dataClient", dataClient);
      // if (dataClient?.type === "client") {
      //   const infoResponse = await api.get("/v1/client/data/info");
      //   const userData = infoResponse.data.data;
      //   const user = {
      //     nome: userData.name,
      //     email: userData.email,
      //     cpf: userData.cpf,
      //     cidade: userData.city,
      //     bairro: userData.neighborhood,
      //     status: userData.status,
      //     estado: userData.uf,
      //     endereco: userData.address,
      //     msg_painel: userData.msg_painel,
      //     msg_status: userData.msg_status,
      //     lastLoan: dataClient?.lastLoan,
      //     zip_code: userData.zip_code,
      //     phone: userData.phone,
      //     pix: userData.chave_pix ?? "",
      //     status_doc: userData.status_doc,
      //     isLoggedIn: true,
      //     observacoes: userData.observacoes,
      //     email_verificado: userData.email_verificado,
      //     phone_verificado: userData.phone_verificado,
      //   };
      //   const token = useRegisterStore.getState().token || "";
      //   await useAuthStore.getState().login(token, user);
      //   router.replace("/(tabs)/home");
      // } else {
      //   const status = dataClient?.status;

      //   useRegisterStore.getState().setData({
      //     ...useRegisterStore.getState().data,
      //     ...dataClient,
      //     primeira_analise: response.data?.data?.data?.primeira_analise ?? 0,
      //   });
      //   useRegisterStore
      //     .getState()
      //     .setToken(useRegisterStore.getState().token || "");

      //   const routeByStatus: Record<string, any> = {
      //     divergente: "/divergencia_screen",
      //     recusado: "/recusado_screen",
      //     aprovado: "/pre_aprovado_screen",
      //     "pre-aprovado": "/pre_aprovado_screen",
      //     analise: "/analise_screen",
      //     reanalise: "/reanalise_screen",
      //     "proposta-expirada": "/divergencia_screen",
      //   };

      //   const targetRoute =
      //     status && routeByStatus[status] ? routeByStatus[status] : null;

      //   const alertContent: Record<string, { title: string; message: string }> =
      //     {
      //       divergente: {
      //         title: "Ação Necessária",
      //         message: "Encontramos uma divergência nos seus dados.",
      //       },
      //       recusado: {
      //         title: "Cadastro Recusado",
      //         message: "Infelizmente seu cadastro não foi aprovado.",
      //       },
      //       aprovado: {
      //         title: "Cadastro Aprovado",
      //         message: "Parabéns! Seu cadastro foi aprovado.",
      //       },
      //       "pre-aprovado": {
      //         title: "Cadastro Pré-Aprovado",
      //         message: "Parabéns! Seu cadastro foi pré-aprovado.",
      //       },
      //       analise: {
      //         title: "Aguarde um momento",
      //         message:
      //           "Seu cadastro ainda está em análise. Por favor, aguarde.",
      //       },
      //       reanalise: {
      //         title: "Aguarde um momento",
      //         message: "Seu cadastro está em reanálise. Por favor, aguarde.",
      //       },
      //       "proposta-expirada": {
      //         title: "Proposta Expirada",
      //         message: "Sua proposta expirou. É necessário atualizar os dados.",
      //       },
      //     };

      //   const alertTitle =
      //     status && alertContent[status]
      //       ? alertContent[status].title
      //       : "Aguarde um momento";
      //   const alertMessage =
      //     status && alertContent[status]
      //       ? alertContent[status].message
      //       : "Seu cadastro ainda está em análise. Por favor, aguarde.";

      //   Alert.alert(alertTitle, alertMessage, [
      //     {
      //       text: "OK",
      //       onPress: () => {
      //         if (targetRoute && targetRoute !== "/pre_aprovado_screen") {
      //           router.replace(targetRoute);
      //         }
      //         // } else {
      //         //   useRegisterStore.getState().clean();
      //         //   router.replace("/login");
      //         // }
      //       },
      //     },
      //   ]);
      // }
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        if (error.response.data.message === "Os Termos já foram aceitos") {
          Alert.alert("Aviso", error.response.data.message, [
            {
              text: "OK",
              onPress: async () => {
                useRegisterStore.getState().clean();
                await useAuthStore.getState().logout();
                router.replace("/login");
              },
            },
          ]);
        } else {
          Alert.alert("Erro", error.response.data.message, [
            {
              text: "OK",
              onPress: async () => {
                useRegisterStore.getState().clean();
                await useAuthStore.getState().logout();
                router.replace("/login");
              },
            },
          ]);
        }
      } else {
        Alert.alert("Erro", "Ocorreu um erro. Tente novamente.", [
          { text: "OK" },
        ]);
      }
    } finally {
      setLoadingAccept(false);
    }
  };

  // sa chamada de video for 0 (que não foi feito a chamada de video) chamar a tela de chamada de video
  if (registerData?.chamada_video === 1) {
    return <ChamadaVideoScreen />;
  }

  // se chamada de video for 1 (que foi feito a chamada de video)
  if (registerData?.chamada_video === 0) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        <AlertDisplay />
        <TermsFinalScreen
          loadingAccept={loadingAccept}
          onAccept={acceptTerms}
        />
      </SafeAreaView>
    );
  }

  return;
};

export default PreAprovado;
