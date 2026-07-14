import ChamadaVideoScreen from "@/components/pre_aprovado/chamada_video_screen";
import TermsFinalScreen from "@/components/pre_aprovado/terms_final_screen";
import ButtonComponent from "@/components/ui/Button";
import StatusBar from "@/components/ui/StatusBar";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useCheckStatus } from "@/hooks/useCheckStatus";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { convertData } from "@/utils";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Network from "expo-network";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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
      const state = registerData?.estado;

      if (!ip || !city || !state) {
        showError(
          "Atenção",
          "Não foi possível aceitar os termos porque faltam cidade, estado ou IP. Faça login novamente para atualizar seus dados.",
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

  if (registerData?.chamada_video === 0 && registerData.termos === 1) {
    return (
      <SafeAreaView style={styles.waitingContainer}>
        <StatusBar />
        <View style={styles.waitingContent}>
          <View style={styles.waitingCard}>
            <FontAwesome5 name="hourglass-half" size={46} color="#14877E" />

            <Text
              style={[
                styles.waitingTitle,
                {
                  fontSize: 32,
                  lineHeight: 42,
                },
              ]}
            >
              Aguardando Liberação
            </Text>

            <Text
              style={[
                styles.waitingDescription,
                {
                  fontSize: 16,
                  lineHeight: 28,
                },
              ]}
            >
              Nossa equipe está trabalhando para liberar sua proposta o mais
              rápido possível. Você será notificado assim que houver uma
              atualização.
            </Text>
          </View>

          <Text
            style={[
              styles.waitingNote,
              {
                fontSize: 16,
                lineHeight: 28,
              },
            ]}
          >
            Não é necessário tomar nenhuma outra ação no momento.
          </Text>
        </View>

        <View style={styles.waitingFooter}>
          <ButtonComponent
            title="Sair"
            onPress={async () => {
              await useAuthStore.getState().logout();
              useRegisterStore.getState().clean();
              router.replace("/login");
            }}
            iconLeft={null}
            iconRight={null}
            outline
          />
        </View>
      </SafeAreaView>
    );
  }

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

const styles = StyleSheet.create({
  waitingContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  waitingContent: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 28,
  },
  waitingCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 20,
  },
  waitingTitle: {
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  waitingDescription: {
    color: Colors.gray.text,
    textAlign: "center",
    fontWeight: "400",
  },
  waitingNote: {
    textAlign: "center",
    color: Colors.gray.text,
    fontWeight: "700",
    paddingHorizontal: 12,
  },
  waitingFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
