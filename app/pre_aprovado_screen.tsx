import {
  ANALYTICS_FLOWS,
  PRE_APPROVED_ANALYTICS_SOURCES,
} from "@/analytics/events";
import ChamadaVideoScreen from "@/components/pre_aprovado/chamada_video_screen";
import TermsFinalScreen from "@/components/pre_aprovado/terms_final_screen";
import { useAlerts } from "@/components/useAlert";
import { useCheckStatus } from "@/hooks/useCheckStatus";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
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

  const analyticsContext = {
    flow: ANALYTICS_FLOWS.APP,
    screen: "pre_aprovado_screen",
    source: PRE_APPROVED_ANALYTICS_SOURCES.ACCEPT_TERMS,
  } as const;

  if (redirectPath) {
    return <Redirect href={redirectPath as any} />;
  }

  const acceptTerms = async () => {
    setLoadingAccept(true);
    try {
      const ip = await Network.getIpAddressAsync();
      const city = registerData?.cidade?.trim();
      const state = registerData?.estado;

      if (!ip || !city || !state) {
        showError(
          "Atenção",
          "Não foi possível aceitar os termos porque faltam cidade, estado ou IP. Faça login novamente para atualizar seus dados.",
        );
        return;
      }

      const payload = {
        // sign_info_date: convertData(),
        // sign_info_ip_address: ip,
        // sign_info_city: city,
        // sign_info_state: state,
        sign_info_country: "BR",
      };

      console.log("payload", payload);

      await api.post("v1/client/acept-term", payload);

      showSuccess(
        "Concluido!",
        "Termos aceitos com sucesso! Você será redirecionado para a página de login para finalizar o processo.",
        () => {
          clean();
          router.replace("/login");
        },
      );
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
        }
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
