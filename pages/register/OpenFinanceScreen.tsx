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
  StyleSheet,
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
      etapa === Etapas.PALENCA ||
      registerData?.etapa === Etapas.OPEN_FINANCE ||
      registerData?.etapa === Etapas.ACEITANDO_TERMOS ||
      registerData?.etapa === Etapas.FINALIZADO ||
      registerData?.etapa === Etapas.PALENCA;
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

  const goToNextStep = useCallback(async () => {
    if (isLeaving.current || hasGoneToTerms.current) return;
    hasGoneToTerms.current = true;

    const currentStore = useRegisterStore.getState();
    const storeData = currentStore.data;

    // Tratamento seguro para evitar falhas de String nula e problemas de Case Sensitive
    const rawProfissao = storeData?.profissao || registerData?.profissao || "";
    const currentProfissao = rawProfissao.trim().toLowerCase();

    const isDriver =
      currentProfissao === "motoboy" || currentProfissao === "motorista";

    const nextEtapa = isDriver ? Etapas.PALENCA : Etapas.ACEITANDO_TERMOS;
    const nextRoute = isDriver ? "/(register)/palenca" : "/(register)/termos";

    // const nextEtapa = Etapas.ACEITANDO_TERMOS;
    // const nextRoute = "/(register)/termos";
    try {
      await api.put("/v1/client/update", { etapa: nextEtapa });

      if (isLeaving.current) return;

      setEtapa(nextEtapa);

      if (storeData) {
        setData({ ...storeData, etapa: nextEtapa });
      } else if (registerData) {
        setData({ ...registerData, etapa: nextEtapa });
      }

      if (isLeaving.current) return;
      router.replace(nextRoute);
    } catch (error) {
      hasGoneToTerms.current = false;
      console.log("goToNextStep error", error);
    }
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
          await goToNextStep();
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
  }, [from, goToNextStep, handleLogout]);

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

          const currentStore = useRegisterStore.getState();
          const storeData = currentStore.data;

          // Mesma normalização segura aplicada no início do ciclo de foco
          const rawProfissao =
            storeData?.profissao || registerData?.profissao || "";
          const currentProfissao = rawProfissao.trim().toLowerCase();

          const isDriver =
            currentProfissao === "motoboy" || currentProfissao === "motorista";

          if (isDriver) {
            const connectEnabled = data?.data?.openfinance?.motorista?.connect;
            console.log("shouldAutoAdvance", shouldAutoAdvance);

            if (!connectEnabled) {
              if (shouldAutoAdvance) {
                await goToNextStep();
              } else {
                setFlowState("idle");
              }
              return;
            }
            const { data: klaviData } = await api.get("/v1/klavi");
            if (cancelled || isLeaving.current) return;
            setAttempts(klaviData?.r_attempts || 0);

            if (klaviData?.status === "aprovado") {
              if (shouldAutoAdvance) {
                await goToNextStep();
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

          if (currentProfissao === "comerciante") {
            const connectEnabled =
              data?.data?.openfinance?.comerciante?.connect;

            if (!connectEnabled) {
              if (shouldAutoAdvance) {
                await goToNextStep();
              } else {
                setFlowState("idle");
              }
              return;
            }

            const { data: klaviData } = await api.get("/v1/klavi");
            if (cancelled || isLeaving.current) return;

            setAttempts(klaviData?.r_attempts || 0);

            if (klaviData?.status === "aprovado") {
              if (shouldAutoAdvance) {
                await goToNextStep();
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
            await goToNextStep();
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
      goToNextStep,
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
          <View style={styles.contentContainer}>
            <ActivityIndicator
              size="large"
              color={Colors.green.primary}
              style={styles.loadingIndicator}
            />

            <Text style={styles.loadingTitle}>{loadingMessage}</Text>

            {flowState === "analyzing" && (
              <Text style={styles.loadingSubtitle}>
                Isso pode levar alguns segundos...
              </Text>
            )}
          </View>
        );

      case "denied":
        return (
          <View style={styles.contentWithHorizontalPadding}>
            <View style={styles.deniedIconWrapper}>
              <X size={40} color="#ef4444" />
            </View>

            <Text style={styles.title}>Cadastro recusado</Text>

            <Text style={styles.infoText}>
              Você tem {attempts} tentativas restantes.
            </Text>

            <Text style={styles.descriptionText}>
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
          <View style={styles.contentWithHorizontalPadding}>
            <View style={styles.retryIconWrapper}>
              <AlertCircle size={40} color="#f97316" />
            </View>

            <Text style={styles.title}>Tentar novamente</Text>

            <Text style={styles.infoText}>
              Você tem {attempts} tentativas restantes.
            </Text>

            <Text style={styles.descriptionText}>
              Não conseguimos aprovar com a conta conectada.
            </Text>

            <Text style={styles.retryHint}>
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
          <View style={styles.contentWithHorizontalPadding}>
            <View style={styles.idleIconWrapper}>
              <Landmark size={40} color="#0f766e" />
            </View>

            <Text style={styles.title}>Conecte sua conta</Text>

            <Text style={styles.infoText}>
              Você tem {attempts} tentativas restantes.
            </Text>

            <Text style={styles.descriptionText}>
              Conecte sua melhor conta para podermos oferecer um crédito
              adequado para você.
            </Text>

            <ButtonComponent
              title="Conectar Conta"
              iconLeft={null}
              iconRight={null}
              onPress={connectKlavi}
            />

            <View style={styles.securityRow}>
              <Lock size={14} color="#9ca3af" style={{ marginRight: 6 }} />

              <Text style={styles.securityText}>
                Conexão segura via Open Finance
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.screen}>
      <AlertDisplay />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    width: "100%",
    alignItems: "center",
  },
  contentWithHorizontalPadding: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingIndicator: {
    marginBottom: 24,
  },
  loadingTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  loadingSubtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
  },
  deniedIconWrapper: {
    marginBottom: 32,
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
  },
  retryIconWrapper: {
    marginBottom: 32,
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ed",
  },
  idleIconWrapper: {
    marginBottom: 32,
    width: 96,
    height: 96,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdfa",
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  infoText: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#6b7280",
  },
  descriptionText: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: "#6b7280",
  },
  retryHint: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  securityRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  securityText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },
});

export default OpenFinanceScreen;
