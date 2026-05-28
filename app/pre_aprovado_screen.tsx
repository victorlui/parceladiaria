import ChamadaVideoScreen from "@/components/pre_aprovado/chamada_video_screen";
import TermsFinalScreen from "@/components/pre_aprovado/terms_final_screen";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { convertData } from "@/utils";
import { tratarEstado } from "@/utils/validation";
import * as Network from "expo-network";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCheckStatus } from "@/hooks/useCheckStatus";

const PreAprovado: React.FC = () => {
  useCheckStatus("/pre_aprovado_screen");
  const { data: registerData } = useRegisterStore();
  const [loadingAccept, setLoadingAccept] = useState(false);

  const acceptTerms = async () => {
    setLoadingAccept(true);
    try {
      const ip = await Network.getIpAddressAsync();

      const payload = {
        sign_info_date: convertData(),
        sign_info_ip_address: ip,
        sign_info_city: registerData?.cidade ?? "São Paulo",
        sign_info_state: tratarEstado(registerData?.estado || "SP"),
        sign_info_country: "BR",
      };

      await api.post("v1/client/acept-term", payload);

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

        useRegisterStore.getState().setData({
          ...useRegisterStore.getState().data,
          ...dataClient,
          primeira_analise: response.data?.data?.data?.primeira_analise ?? 0,
        });
        useRegisterStore
          .getState()
          .setToken(useRegisterStore.getState().token || "");

        const routeByStatus: Record<string, any> = {
          divergente: "/divergencia_screen",
          recusado: "/recusado_screen",
          aprovado: "/pre_aprovado_screen",
          "pre-aprovado": "/pre_aprovado_screen",
          analise: "/analise_screen",
          reanalise: "/reanalise_screen",
          "proposta-expirada": "/divergencia_screen",
        };

        const targetRoute =
          status && routeByStatus[status] ? routeByStatus[status] : null;

        const alertContent: Record<string, { title: string; message: string }> =
          {
            divergente: {
              title: "Ação Necessária",
              message: "Encontramos uma divergência nos seus dados.",
            },
            recusado: {
              title: "Cadastro Recusado",
              message: "Infelizmente seu cadastro não foi aprovado.",
            },
            aprovado: {
              title: "Cadastro Aprovado",
              message: "Parabéns! Seu cadastro foi aprovado.",
            },
            "pre-aprovado": {
              title: "Cadastro Pré-Aprovado",
              message: "Parabéns! Seu cadastro foi pré-aprovado.",
            },
            analise: {
              title: "Aguarde um momento",
              message:
                "Seu cadastro ainda está em análise. Por favor, aguarde.",
            },
            reanalise: {
              title: "Aguarde um momento",
              message: "Seu cadastro está em reanálise. Por favor, aguarde.",
            },
            "proposta-expirada": {
              title: "Proposta Expirada",
              message: "Sua proposta expirou. É necessário atualizar os dados.",
            },
          };

        const alertTitle =
          status && alertContent[status]
            ? alertContent[status].title
            : "Aguarde um momento";
        const alertMessage =
          status && alertContent[status]
            ? alertContent[status].message
            : "Seu cadastro ainda está em análise. Por favor, aguarde.";

        Alert.alert(alertTitle, alertMessage, [
          {
            text: "OK",
            onPress: () => {
              if (targetRoute && targetRoute !== "/pre_aprovado_screen") {
                router.replace(targetRoute);
              }
              // } else {
              //   useRegisterStore.getState().clean();
              //   router.replace("/login");
              // }
            },
          },
        ]);
      }
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
          Alert.alert("Erro", error.response.data.message, [{ text: "OK" }]);
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

  // Fluxo futuro
  // se chamada de video for 1 (que foi feito a chamada de video)
  // e o opt for obrigatorio chama a tela de termos e o otp
  //   if (
  //     userRegister?.chamada_video === 1 &&
  //     userRegister?.otp_obrigatorio === 1
  //   ) {
  //     return <OtpScreen />;
  //   }

  //FLuxo Futuro
  // se chamada de video for 1 (que foi feito a chamada de video)
  // e o opt for false chama a tela de termos
  //  if (
  //     userRegister?.chamada_video === 1
  //     userRegister?.otp_obrigatorio === 0
  //   )

  // se chamada de video for 1 (que foi feito a chamada de video)
  if (registerData?.chamada_video === 0) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <TermsFinalScreen
            loadingAccept={loadingAccept}
            onAccept={acceptTerms}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return;
};

export default PreAprovado;
