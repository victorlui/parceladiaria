import ButtonChat from "@/components/ui/ButtonChat";
import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { useCheckStatus } from "@/hooks/useCheckStatus";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { FontAwesome5 } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AnaliseScreen: React.FC = () => {
  const { redirectPath } = useCheckStatus("/analise_screen");
  useDisableBackHandler();
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (redirectPath) {
    return <Redirect href={redirectPath as any} />;
  }

  const checkStatus = async () => {
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
              if (targetRoute && targetRoute !== "/analise_screen") {
                router.replace(targetRoute);
              }
            },
          },
        ]);
      }
    } catch (error) {
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <Image
        source={require("@/assets/images/logo-verde.png")}
        style={styles.logo}
      />
      <View style={styles.card}>
        <FontAwesome5 name="hourglass-half" size={50} color="#f7ab09" />
        <Text style={styles.title}>Cadastro em análise</Text>
        <Text style={styles.subtitle}>
          Recebemos seus documentos e nossa equipe já está fazendo a validação.
          O processo pode levar ate 24 horas após o envio dos documentos.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={checkStatus}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.buttonPrimaryText}>Verificar status</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          logout();
          useRegisterStore.getState().clean();
          router.replace("/login");
        }}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
      <ButtonChat />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    margin: 20,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
    marginVertical: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "300",
    color: Colors.gray.text,
    textAlign: "center",
  },
  buttonPrimary: {
    backgroundColor: Colors.green.primary,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    width: "100%",
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.white,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: Colors.gray.primary,
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
});

export default AnaliseScreen;
