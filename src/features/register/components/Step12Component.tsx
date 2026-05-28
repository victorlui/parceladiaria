import { useAuthStore } from "@/features/auth/store/useAuthStore";
import ButtonComponent from "@/shared/components/Button";
import PulsingImageLoader from "@/shared/components/PulsingImageLoader";
import { Colors } from "@/shared/constants/colors";
import api from "@/shared/service/api";
import { useAlertStore } from "@/shared/store/useAlertStore";
import { Etapas } from "@/shared/utils/etapas";
import { useIsFocused } from "@react-navigation/native";
import { router, useFocusEffect } from "expo-router";
import { AlertCircle, Landmark, Lock, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Linking, Text, View } from "react-native";

type FlowState =
  | "checking"
  | "idle"
  | "connecting"
  | "analyzing"
  | "approved"
  | "denied"
  | "retry"
  | "skip";

interface Props {
  onNext: () => void | Promise<void>;
  isLoading?: boolean;
}

const Step12Component: React.FC<Props> = ({ onNext }) => {
  const { user, updateUser } = useAuthStore();
  const { showAlert } = useAlertStore();
  const isFocused = useIsFocused();

  const registerData = user;
  const registerToken = user?.token;

  const [flowState, setFlowState] = useState<FlowState>("checking");
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState("Verificando status...");

  const appState = useRef(AppState.currentState);
  const hasGoneToTerms = useRef(false);
  const isLeaving = useRef(false);

  useEffect(() => {
    if (!registerToken) {
      useAuthStore.getState().logout();
      router.replace("/login");
      return;
    }
  }, [registerToken]);

  const handleLogout = useCallback(() => {
    showAlert(
      "warning",
      "Conexão perdida",
      "Não foi possível continuar. Vamos reiniciar seu cadastro.",
    );
    useAuthStore.getState().logout();
    router.replace("/login");
  }, [showAlert]);

  const goToTerms = useCallback(async () => {
    if (isLeaving.current) return;
    if (hasGoneToTerms.current) return;
    hasGoneToTerms.current = true;

    try {
      await api.put("/v1/client/update", {
        etapa: Etapas.ACEITANDO_TERMOS,
      });
      if (isLeaving.current) return;

      updateUser({ etapa: Etapas.ACEITANDO_TERMOS });
    } catch (error) {
      console.log("update etapa error", error);
    }

    if (isLeaving.current) return;
    onNext();
  }, [updateUser, onNext]);

  const connectKlavi = useCallback(async () => {
    if (isLeaving.current) return;

    try {
      setFlowState("connecting");

      const { data } = await api.post("/v1/klavi/connect", {
        redirect: "expotemplatebase://register-openfinance",
      });

      if (isLeaving.current) return;

      const url = data?.data?.body?.linkURL;

      if (url) {
        Linking.openURL(url);
      } else {
        setFlowState("idle");
      }
    } catch (error: any) {
      console.log("connect klavi error", error?.response ?? error);

      setFlowState("idle");

      if (error?.response?.status === 401) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  const checkAnalysisStatus = useCallback(async () => {
    if (isLeaving.current) return;

    try {
      const { data } = await api.get("/v1/cliente/check-status");
      if (isLeaving.current) return;

      const status = data?.status;

      setAttempts(data?.r_attempts || 0);

      if (status === "aprovado") {
        setFlowState("approved");
        await goToTerms();
        return;
      }

      if (status === "completed") {
        return;
      }

      if (data?.r_attempts > 0) {
        setFlowState("retry");
      } else {
        setFlowState("denied");
      }
    } catch (error: any) {
      console.log("checkAnalysisStatus error", error?.response ?? error);

      if (error?.response?.status === 401) {
        handleLogout();
      }
    }
  }, [goToTerms, handleLogout]);

  /**
   * INITIAL FLOW
   */
  useFocusEffect(
    useCallback(() => {
      if (!registerToken) return;

      let cancelled = false;
      hasGoneToTerms.current = false;
      setFlowState("checking");
      setLoading(true);

      (async () => {
        if (isLeaving.current) return;

        try {
          const { data } = await api.get("v1/register/settings");
          if (cancelled || isLeaving.current) return;

          const isDriver =
            registerData?.profissao === "Motoboy" ||
            registerData?.profissao === "Motorista";

          if (isDriver) {
            const connectEnabled = data?.data?.openfinance?.motorista?.connect;

            if (!connectEnabled) {
              await goToTerms();
              return;
            }
            const { data: klaviData } = await api.get("/v1/klavi");
            console.log("klaviData motorista", klaviData);
            if (cancelled || isLeaving.current) return;
            setAttempts(klaviData?.r_attempts || 0);

            if (klaviData?.status === "aprovado") {
              await goToTerms();
              return;
            }

            if (klaviData?.r_attempts <= 0) {
              setFlowState("denied");
            } else {
              setFlowState("idle");
            }

            return;
          }

          if (registerData?.profissao === "Comerciante") {
            const connectEnabled =
              data?.data?.openfinance?.comerciante?.connect;

            if (!connectEnabled) {
              await goToTerms();
              return;
            }

            const { data: klaviData } = await api.get("/v1/klavi");
            if (cancelled || isLeaving.current) return;
            console.log("klaviData comerciante", klaviData);
            setAttempts(klaviData?.r_attempts || 0);

            if (klaviData?.status === "aprovado") {
              await goToTerms();
              return;
            }

            if (klaviData?.r_attempts <= 0) {
              setFlowState("denied");
            } else {
              setFlowState("idle");
            }

            return;
          }

          await goToTerms();
        } catch (error: any) {
          console.log("initialize error", error?.response ?? error);

          if (!cancelled && !isLeaving.current) {
            setFlowState("idle");
          }
        } finally {
          if (!cancelled && !isLeaving.current) {
            setLoading(false);
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [registerToken, registerData?.profissao, goToTerms]),
  );

  /**
   * APP STATE
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (flowState === "connecting") {
          setFlowState("analyzing");
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [flowState]);

  /**
   * POLLING
   */
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isFocused && flowState === "analyzing") {
      setLoadingMessage("Analisando seus dados bancários...");

      checkAnalysisStatus();

      intervalId = setInterval(checkAnalysisStatus, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [checkAnalysisStatus, flowState, isFocused]);

  /**
   * LOADING SCREEN
   */
  if (loading) {
    return (
      <View style={{ height: 300 }}>
        <PulsingImageLoader size={120} text="Aguarde..." />
      </View>
    );
  }

  /**
   * RENDER CONTENT
   */
  const renderContent = () => {
    switch (flowState) {
      case "connecting":
      case "analyzing":
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
              Cadastro recusado
            </Text>

            <Text className="mb-3 text-center text-base leading-6 text-gray-500">
              Você tem {attempts} tentativas restantes.
            </Text>

            <Text className="mb-6 text-center text-base leading-6 text-gray-500">
              Infelizmente não foi possível aprovar seu empréstimo neste
              momento.
            </Text>

            <ButtonComponent
              title="Sair"
              outline
              iconLeft={null}
              iconRight={null}
              onPress={() => {
                useAuthStore.getState().logout();
                router.replace("/login");
              }}
            />
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

            <Text className="mb-3 text-center text-base leading-6 text-gray-500">
              Você tem {attempts} tentativas restantes.
            </Text>

            <Text className="mb-6 text-center text-base leading-6 text-gray-500">
              Não conseguimos aprovar com a conta conectada.
            </Text>

            <Text
              className="mb-10 text-center text-sm font-semibold text-gray-500"
              style={{ marginBottom: 24 }}
            >
              Conecte outra conta bancária (de preferência onde você tem maior
              movimentação).
            </Text>

            <ButtonComponent
              title="Conectar outra conta"
              iconLeft={null}
              iconRight={null}
              onPress={connectKlavi}
            />
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

            <Text className="mb-3 text-center text-base leading-6 text-gray-500">
              Você tem {attempts} tentativas restantes.
            </Text>

            <Text
              className="mb-10 text-center text-base leading-6 text-gray-500"
              style={{ marginBottom: 24 }}
            >
              Conecte sua melhor conta para podermos oferecer um crédito
              adequado para você.
            </Text>

            <ButtonComponent
              title="Conectar Conta"
              iconLeft={null}
              iconRight={null}
              onPress={connectKlavi}
            />

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

  return <>{renderContent()}</>;
};

export default Step12Component;
