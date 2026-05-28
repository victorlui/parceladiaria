import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { Etapas } from "@/utils";
import { useIsFocused } from "@react-navigation/native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { AlertCircle, Landmark, Lock, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Linking,
  Text,
  View,
} from "react-native";
import PulsingImageLoader from "./components/PulsingImageLoader";

type FlowState =
  | "checking"
  | "idle"
  | "connecting"
  | "analyzing"
  | "approved"
  | "denied"
  | "retry"
  | "skip";

const OpenFinanceScreen: React.FC = () => {
  const {
    data: registerData,
    token: registerToken,
    etapa,
    step,
    setStep,
    setData,
    setEtapa,
    hydrated,
  } = useRegisterStore();
  const { AlertDisplay, showWarningPress } = useAlerts();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const params = useLocalSearchParams<{ from?: string }>();
  const from = typeof params.from === "string" ? params.from : undefined;

  const [flowState, setFlowState] = useState<FlowState>("checking");

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState("Verificando status...");

  const appState = useRef(AppState.currentState);
  const hasGoneToTerms = useRef(false);
  const isLeaving = useRef(false);

  const navigateToStep1 = useCallback(() => {
    if (isLeaving.current) return true;
    isLeaving.current = true;
    setStep(8);
    router.replace("/(register)/step1");
    return true;
  }, [setStep]);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated) return;

      const hardwareSub = BackHandler.addEventListener(
        "hardwareBackPress",
        navigateToStep1,
      );

      const beforeRemoveSub = navigation.addListener(
        "beforeRemove",
        (e: any) => {
          const actionType = e?.data?.action?.type;
          if (actionType !== "POP" && actionType !== "GO_BACK") return;
          if (isLeaving.current) return;
          e.preventDefault();
          navigateToStep1();
        },
      );

      return () => {
        hardwareSub.remove();
        beforeRemoveSub();
      };
    }, [hydrated, navigation, navigateToStep1]),
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!registerToken) {
      useRegisterStore.getState().clean();
      router.replace("/(register)/step1");
      return;
    }
    const allowed =
      step >= 8 ||
      etapa === Etapas.OPEN_FINANCE ||
      etapa === Etapas.ACEITANDO_TERMOS ||
      etapa === Etapas.FINALIZADO ||
      registerData?.etapa === Etapas.OPEN_FINANCE ||
      registerData?.etapa === Etapas.ACEITANDO_TERMOS ||
      registerData?.etapa === Etapas.FINALIZADO;
    if (!allowed) {
      router.replace("/(register)/step1");
      return;
    }
  }, [etapa, hydrated, registerToken, registerData?.etapa, step]);

  const handleLogout = useCallback(() => {
    showWarningPress(
      "Conexão perdida",
      "Não foi possível continuar. Vamos reiniciar seu cadastro.",
      () => {
        useRegisterStore.getState().clean();
        router.replace("/(register)/step1");
      },
    );
  }, [showWarningPress]);

  const goToTerms = useCallback(async () => {
    if (isLeaving.current) return;
    if (hasGoneToTerms.current) return;
    hasGoneToTerms.current = true;

    try {
      await api.put("/v1/client/update", {
        etapa: Etapas.ACEITANDO_TERMOS,
      });
      if (isLeaving.current) return;

      setEtapa(Etapas.ACEITANDO_TERMOS);
      if (registerData) {
        setData({ ...registerData, etapa: Etapas.ACEITANDO_TERMOS });
      }
    } catch (error) {
      console.log("update etapa error", error);
    }

    if (isLeaving.current) return;
    router.replace("/(register)/termos");
  }, [registerData, setData, setEtapa]);

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
        if (from !== "termos") {
          await goToTerms();
        } else {
          setFlowState("idle");
        }

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
  }, [from, goToTerms, handleLogout]);

  /**
   * INITIAL FLOW
   */
  useFocusEffect(
    useCallback(() => {
      if (!hydrated || !registerToken) return;

      let cancelled = false;
      hasGoneToTerms.current = false;
      setFlowState("checking");
      setLoading(true);

      (async () => {
        if (isLeaving.current) return;

        try {
          const shouldAutoAdvance = from !== "termos";

          const { data } = await api.get("v1/register/settings");
          if (cancelled || isLeaving.current) return;

          const isDriver =
            registerData?.profissao === "Motoboy" ||
            registerData?.profissao === "Motorista";

          if (isDriver) {
            const connectEnabled = data?.data?.openfinance?.motorista?.connect;

            if (!connectEnabled) {
              if (shouldAutoAdvance) {
                await goToTerms();
              } else {
                setFlowState("idle");
              }
              return;
            }
            const { data: klaviData } = await api.get("/v1/klavi");
            console.log("klaviData comerciante", klaviData);
            if (cancelled || isLeaving.current) return;
            setAttempts(klaviData?.r_attempts || 0);

            if (klaviData?.status === "aprovado") {
              if (shouldAutoAdvance) {
                await goToTerms();
              } else {
                setFlowState("idle");
              }
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
              if (shouldAutoAdvance) {
                await goToTerms();
              } else {
                setFlowState("idle");
              }
              return;
            }

            const { data: klaviData } = await api.get("/v1/klavi");
            if (cancelled || isLeaving.current) return;
            console.log("klaviData comerciante", klaviData);
            setAttempts(klaviData?.r_attempts || 0);

            if (klaviData?.status === "aprovado") {
              if (shouldAutoAdvance) {
                await goToTerms();
              } else {
                setFlowState("idle");
              }
              return;
            }

            if (klaviData?.r_attempts <= 0) {
              setFlowState("denied");
            } else {
              setFlowState("idle");
            }

            return;
          }

          if (shouldAutoAdvance) {
            await goToTerms();
          } else {
            setFlowState("idle");
          }
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
    }, [
      etapa,
      hydrated,
      registerToken,
      registerData?.etapa,
      registerData?.profissao,
      from,
      goToTerms,
    ]),
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
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        size={120}
        text="Aguarde..."
      />
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

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <AlertDisplay />
      {renderContent()}
    </View>
  );
};

export default OpenFinanceScreen;
