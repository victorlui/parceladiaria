import ChamadaVideoScreen from "@/components/pre_aprovado/chamada_video_screen";
import TermsFinalScreen from "@/components/pre_aprovado/terms_final_screen";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { convertData, Etapas } from "@/utils";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Network from "expo-network";

const PreAprovado: React.FC = () => {
  const { userRegister } = useAuthStore();
  const [loadingAccept, setLoadingAccept] = useState(false);

  const acceptTerms = async () => {
    setLoadingAccept(true);
    try {
      const ip = await Network.getIpAddressAsync();

      const payload = {
        sign_info_date: convertData(),
        sign_info_ip_address: ip,
        sign_info_city: userRegister?.cidade ?? "São Paulo",
        sign_info_state: userRegister?.estado ?? "SP",
        sign_info_country: "BR",
      };

      await api.post("v1/client/acept-term", payload);
      Alert.alert(
        "Sucesso",
        "Contrato aceito com sucesso. Faça login novamente para continuar.",
        [{ text: "Entrar", onPress: () => router.replace("/login") }],
      );
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        Alert.alert("Erro", error.response.data.message, [{ text: "OK" }]);
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
  if (userRegister?.chamada_video === 1) {
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
  if (userRegister?.chamada_video === 0) {
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
