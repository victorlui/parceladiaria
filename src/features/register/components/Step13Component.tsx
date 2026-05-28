import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ButtonComponent from "@/shared/components/Button";
import PulsingImageLoader from "@/shared/components/PulsingImageLoader";
import { Colors } from "@/shared/constants/colors";
import api from "@/shared/service/api";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { useUpdateUserHook } from "../hooks/useUpdateUserHook";

const maskCpf = (val: string) => {
  if (!val) return "";
  return val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const maskPhone = (val: string) => {
  if (!val) return "";
  return val.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const Step13Component: React.FC = () => {
  const { width } = useWindowDimensions();
  const { mutate, isPending, isSuccess } = useUpdateUserHook();
  const { user, updateUser, setUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [terms, setTerms] = useState("");
  const [accepted, setAccepted] = useState(false);
  const hasLoadedTerms = useRef(false);

  const loadTerms = useCallback(async () => {
    if (hasLoadedTerms.current) return;
    if (terms.trim().length > 0) {
      hasLoadedTerms.current = true;
      return;
    }
    if (!user?.token) return;

    setIsLoading(true);
    try {
      const response = await api.get("termos/Proposta_condicionada");
      const content = response?.data?.termo?.content || "";
      setTerms(content);
      hasLoadedTerms.current = true;
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  }, [terms, user?.token]);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const onSubmit = async () => {
    if (!accepted) {
      return;
    }

    try {
      mutate({
        request: {
          etapa: "Finalizado",
          flow: 1,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const [loading, setLoading] = useState(false);
  const completeRegistration = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/v1/client");
      const dataClient =
        response.data?.data?.data || response.data?.data || response.data;
      if (dataClient?.type === "client") {
        const infoResponse = await api.get("/v1/client/data/info");
        const userData = infoResponse.data.data;
        const userPayload = {
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
          whatsapp: userData.phone,
          pix: userData.chave_pix ?? "",
          status_doc: userData.status_doc,
          isLoggedIn: true,
          observacoes: userData.observacoes,
          email_verificado: userData.email_verificado,
          phone_verificado: userData.phone_verificado,
          token: user?.token || "",
        };
        setUser(userPayload as any);
        router.replace("/(tabs)/home" as any);
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

        updateUser({
          ...dataClient,
          primeira_analise: response.data?.data?.data?.primeira_analise ?? 0,
        });

        const targetRoute =
          status && routeByStatus[status] ? routeByStatus[status] : null;

        if (targetRoute) {
          router.replace(targetRoute as any);
        } else {
          useAuthStore.getState().logout();
          router.replace("/login");
        }
      }
    } catch (error) {
      useAuthStore.getState().logout();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [user?.token, setUser, updateUser]);

  useEffect(() => {
    if (isSuccess) {
      completeRegistration();
    }
  }, [isSuccess, completeRegistration]);

  if (loading || (isLoading && terms.trim().length === 0) || isPending) {
    return (
      <Modal visible transparent={false} animationType="fade">
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
          <PulsingImageLoader
            text={
              loading
                ? "Finalizando cadastro..."
                : isLoading
                  ? "Carregando termos..."
                  : "Aguarde..."
            }
          />
        </View>
      </Modal>
    );
  }

  return (
    <>
      <View style={styles.propostaContainer}>
        <Text style={[styles.propostaTitle, { marginBottom: 0 }]}>
          Proposta para
        </Text>
        <Text style={styles.propostaTitle}>
          {user?.nome
            ?.split(" ")
            .map((part: string, index: number) =>
              index === 0 ? part : part.charAt(0).toUpperCase() + ".",
            )
            .join(" ")}
        </Text>
        <Text style={styles.propostaText}>CPF: {maskCpf(user?.cpf || "")}</Text>
        <Text style={styles.propostaText}>
          Telefone: {maskPhone(user?.whatsapp || "")}
        </Text>
      </View>
      <View
        style={{
          marginHorizontal: 0,
          width: "100%",
          height: 250,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
          backgroundColor: "#fff",
        }}
      >
        <ScrollView showsVerticalScrollIndicator={true}>
          <RenderHTML contentWidth={width - 50} source={{ html: terms }} />
        </ScrollView>
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
        </View>
      </TouchableOpacity>
      <ButtonComponent
        iconLeft={null}
        iconRight={"checkmark"}
        title="Finalizar Cadastro"
        onPress={onSubmit}
        disabled={!accepted}
      />
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

export default Step13Component;
