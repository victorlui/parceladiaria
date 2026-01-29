import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { Etapas } from "@/utils";
import { router } from "expo-router";
import { Landmark, Lock, X, AlertCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FlowState =
  | "checking"
  | "idle"
  | "connecting"
  | "analyzing"
  | "approved"
  | "denied"
  | "retry";

const OpenFinance: React.FC = () => {
  const { mutate } = useUpdateUserMutation();
  const { logout, tokenRegister } = useAuthStore();
  const { AlertDisplay, showWarningPress } = useAlerts();

  const [flowState, setFlowState] = useState<FlowState>("checking");
  const [attempts, setAttempts] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState("Verificando status...");

  const appState = useRef(AppState.currentState);

  // Initial Check
  useEffect(() => {
    checkInitialStatus();
  }, []);

  // Monitor AppState to detect return from Bank App
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (flowState === "connecting") {
          console.log("Retornou do banco, iniciando análise...");
          setFlowState("analyzing");
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [flowState]);

  // Polling Logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (flowState === "analyzing") {
      setLoadingMessage("Analisando seus dados bancários...");
      // Check immediately
      checkAnalysisStatus();
      // Then poll every 10s
      intervalId = setInterval(checkAnalysisStatus, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [flowState]);

  async function checkInitialStatus() {
    try {
      setLoadingMessage("Verificando status...");
      const { data } = await api.get(`/v1/klavi`, {
        headers: {
          Authorization: `Bearer ${tokenRegister}`,
        },
      });

      console.log("/v1/klavi", data);

      if (data?.status === "aprovado") {
        await api.put(
          "/v1/client/update",
          {
            etapa: Etapas.ACEITANDO_TERMOS,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenRegister}`,
            },
          },
        );
        setFlowState("approved");
        router.replace("/(register_new)/register-finish");
        return;
      } else if (data?.r_attempts > 0) {
        setFlowState("idle");
        return;
      } else {
        setFlowState("denied");
        return;
      }
    } catch (error: any) {
      setFlowState("idle");
    }
  }

  async function connectKlavi() {
    try {
      setFlowState("connecting");
      const { data } = await api.post(
        `/v1/klavi/connect`,
        {
          redirect: "expotemplatebase://register-openfinance",
        },
        {
          headers: {
            Authorization: `Bearer ${tokenRegister}`,
          },
        },
      );

      if (data && data.data.body.linkURL) {
        Linking.openURL(data.data.body.linkURL);
      } else {
        setFlowState("idle");
      }
    } catch (error: any) {
      console.log("Connect error:", error.response);
      setFlowState("idle");
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  }

  async function checkAnalysisStatus() {
    try {
      const { data } = await api.get(`/v1/cliente/check-status`, {
        headers: {
          Authorization: `Bearer ${tokenRegister}`,
        },
      });

      console.log("/v1/cliente/check-status:", data);

      const status = data?.status;
      // Check for attempts or r_attempts
      const attemptsLeft = data?.r_attempts !== undefined ? data.r_attempts : 0;

      setAttempts(attemptsLeft);

      if (status === "aprovado") {
        await api.put(
          "/v1/client/update",
          {
            etapa: Etapas.ACEITANDO_TERMOS,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenRegister}`,
            },
          },
        );
        setFlowState("approved");
        router.replace("/(register_new)/register-finish");
        return;
      } else if (status === "completed") {
        return;
      } else {
        if (attemptsLeft > 0) {
          setFlowState("retry");
          return;
        } else {
          setFlowState("denied");
          return;
        }
      }
    } catch (error: any) {
      console.log("Polling error:", error.response);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  }

  function handleLogout() {
    showWarningPress(
      "Conexão perdida",
      "Você foi desconectado. Faça login novamente",
      () => {
        logout();
        router.replace("/login");
      },
    );
  }

  const renderContent = () => {
    switch (flowState) {
      case "checking":
      case "analyzing":
      case "connecting":
      case "approved":
        return (
          <View className="w-full items-center">
            <ActivityIndicator
              size="large"
              color={Colors.green.primary}
              className="mb-6"
            />
            <Text className="text-center text-lg font-semibold text-gray-800">
              {loadingMessage}
            </Text>
            {flowState === "analyzing" && (
              <Text className="mt-2 text-center text-sm text-gray-500">
                Isso pode levar alguns segundos...
              </Text>
            )}
          </View>
        );

      case "denied":
        return (
          <View className="w-full items-center px-4">
            <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-red-50">
              <X size={40} color="#ef4444" />
            </View>

            <Text className="mb-3 text-center text-2xl font-bold text-slate-900">
              Empréstimo negado
            </Text>

            <Text className="mb-6 text-center text-base leading-6 text-gray-500">
              Infelizmente não foi possível aprovar seu empréstimo neste
              momento.
            </Text>

            <Text className="mb-10 text-center text-sm font-semibold text-gray-500">
              Você pode tentar novamente em 60 dias.
            </Text>

            <TouchableOpacity
              className="w-full flex-row items-center justify-center rounded-xl border border-teal-800 bg-white py-4"
              onPress={() => {
                router.replace("/login");
              }}
            >
              <Text className="text-lg font-semibold text-teal-800">
                Voltar ao início
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "retry":
        return (
          <View className="w-full items-center px-4">
            <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-orange-50">
              <AlertCircle size={40} color="#f97316" />
            </View>

            <Text className="mb-3 text-center text-2xl font-bold text-slate-900">
              Tentar novamente
            </Text>

            <Text className="mb-6 text-center text-base leading-6 text-gray-500">
              Não conseguimos aprovar com a conta conectada.
            </Text>

            <Text className="mb-10 text-center text-sm font-semibold text-gray-500">
              Conecte outra conta bancária (de preferência onde você tem maior
              movimentação).
            </Text>

            <TouchableOpacity
              className="w-full flex-row items-center justify-center rounded-xl bg-teal-800 py-4"
              onPress={connectKlavi}
            >
              <Text className="text-lg font-semibold text-white">
                Conectar outra conta
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "idle":
      default:
        return (
          <View className="w-full items-center px-4">
            <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-teal-50">
              <Landmark size={40} color="#0f766e" />
            </View>

            <Text className="mb-3 text-center text-2xl font-bold text-slate-900">
              Conecte sua conta
            </Text>

            <Text className="mb-10 text-center text-base leading-6 text-gray-500">
              Conecte sua melhor conta para podermos oferecer um crédito
              adequado para você.
            </Text>

            <TouchableOpacity
              className="w-full flex-row items-center justify-center rounded-xl bg-teal-800 py-4"
              onPress={connectKlavi}
            >
              <Text className="text-lg font-semibold text-white">
                Conectar Conta
              </Text>
            </TouchableOpacity>

            <View className="mt-6 flex-row items-center">
              <Lock size={14} color="#9ca3af" style={{ marginRight: 6 }} />
              <Text className="text-sm text-gray-400">
                Conexão segura via Open Finance
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <AlertDisplay />
      {renderContent()}
    </View>
  );
};

export default OpenFinance;
