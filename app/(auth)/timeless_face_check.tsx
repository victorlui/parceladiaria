import FaceCaptureWebView from "@/pages/face/components/FaceCaptureWebView";
import { router } from "expo-router";
import React, { useState } from "react";
import * as Network from "expo-network";
import { Alert } from "react-native";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useAuthStore } from "@/store/auth";
import api from "@/services/api";
import LoadingScreen from "@/pages/face/components/LoadingScreen";

const TimeLess: React.FC = () => {
  const { isPending } = useLoginMutation();
  const { cpfValid, register } = useAuthStore((state) => state);
  const [loading, setLoading] = useState(false);

  const sendFace = async (face: any) => {
    setLoading(true);
    try {
      if (!face) {
        return;
      }

      const { isInternetReachable } = await Network.getNetworkStateAsync();
      if (isInternetReachable === false) {
        Alert.alert(
          "Sem conexão",
          "Verifique sua conexão com a internet e tente novamente.",
        );
        return;
      }

      const data = {
        cpf: cpfValid,
        selfie: face.file.uri,
      };
      const response = await api.post("auth/verify-identity", data);
      register(response.data.data.token, {
        cpf: response.data.data.cpf,
        nome: response.data.data.nome,
        pixKey: "",
      });
      router.push("/(auth)/change-password-screen");
      return;
    } catch (error: any) {
      const { isInternetReachable } = await Network.getNetworkStateAsync();
      if (isInternetReachable === false) {
        Alert.alert(
          "Conexão perdida",
          "Sua internet caiu durante o envio. Verifique a conexão e tente novamente.",
        );
      } else if (
        error.response &&
        error.response.data.message === "Biometria facial não confirmada."
      ) {
        Alert.alert("Erro", "Biometria facial não confirmada.", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao enviar a foto.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return <LoadingScreen />;
  }

  return (
    <FaceCaptureWebView
      visible={true}
      onSuccess={sendFace}
      onClose={() => {
        router.back();
      }}
    />
  );
};

export default TimeLess;
