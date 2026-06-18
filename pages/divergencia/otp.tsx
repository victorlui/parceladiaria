import { AnalyticsService } from "@/analytics/analytics.service";
import {
  ANALYTICS_FLOWS,
  DIVERGENCIA_ANALYTICS_SOURCES,
  DIVERGENCIA_SCREENS,
} from "@/analytics/events";
import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useFinalizeDivergenciaFlow } from "@/pages/divergencia/hook/useFinalizeDivergenciaFlow";
import PulsingImageLoader from "@/pages/register/components/PulsingImageLoader";
import { api, withAnalytics } from "@/services/api";
import { useRegisterStore } from "@/store/register_new";
import { maskPhone } from "@/utils/mask";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface Props {
  mode?: "edit_phone" | "verify_otp";
  initialPhone?: string;
  phoneDigits?: string;
  phoneMasked?: string;
  back?: () => void;
  onPhoneSaved?: (phone: string) => void;
}

const getPhoneOtpErrorMessage = (error: any) => {
  const responseData = error?.response?.data;
  const message = responseData?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error?.response?.status === 429) {
    if (responseData?.bloqueado) {
      return "Envio temporariamente bloqueado. Tente novamente em 24 horas.";
    }

    if (typeof responseData?.retry_after === "number") {
      return `Aguarde ${responseData.retry_after}s para solicitar um novo codigo.`;
    }
  }

  return "Nao foi possivel enviar o codigo para o novo numero.";
};

const getPhoneConfirmErrorMessage = (error: any) => {
  const responseData = error?.response?.data;
  const message = responseData?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error?.response?.status === 403) {
    if (typeof responseData?.tentativas_restantes === "number") {
      return `Codigo invalido ou expirado. Restam ${responseData.tentativas_restantes} tentativa(s).`;
    }

    return "Solicitacao expirada. Solicite um novo codigo para alterar o telefone.";
  }

  if (error?.response?.status === 429 && responseData?.bloqueado) {
    return "Validacao temporariamente bloqueada. Tente novamente em 24 horas.";
  }

  if (error?.response?.status === 422) {
    return "Informe um codigo OTP valido.";
  }

  return "Nao foi possivel confirmar o codigo do novo numero.";
};

export default function OtpDivergencia({
  mode = "verify_otp",
  initialPhone = "",
  phoneDigits = "",
  phoneMasked = "",
  back,
  onPhoneSaved,
}: Props) {
  const { data, setData } = useRegisterStore();
  const { AlertDisplay, showWarning, showSuccess } = useAlerts();
  const { finalizeDivergenciaFlow, loadingSubmit } =
    useFinalizeDivergenciaFlow();
  const registeredPhoneDigits = String(data?.whatsapp ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);
  const initialTargetPhoneDigits = phoneDigits || registeredPhoneDigits;
  const initialPhoneChangeFlow =
    initialTargetPhoneDigits.length === 11 &&
    initialTargetPhoneDigits !== registeredPhoneDigits;
  const [screenMode, setScreenMode] = useState<Props["mode"]>(mode);
  const [phone, setPhone] = useState(initialPhone);
  const [phoneBaselineDigits, setPhoneBaselineDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(initialPhoneChangeFlow ? 30 : 45);
  const [isLoading, setIsLoading] = useState(false);
  const [targetPhoneDigits, setTargetPhoneDigits] = useState(
    initialTargetPhoneDigits,
  );
  const [targetPhoneMasked, setTargetPhoneMasked] = useState(
    phoneMasked ||
      (initialTargetPhoneDigits ? maskPhone(initialTargetPhoneDigits) : ""),
  );

  const otpDigits = useMemo(() => otp.replace(/\D/g, "").slice(0, 6), [otp]);
  const phoneValueDigits = useMemo(() => phone.replace(/\D/g, ""), [phone]);
  const phoneError = useMemo(() => {
    if (!phoneValueDigits) return "";
    return phoneValueDigits.length === 11 ? "" : "Celular invalido";
  }, [phoneValueDigits]);
  const canSavePhone = phoneValueDigits.length === 11 && !phoneError;
  const canSubmit = otpDigits.length === 6;
  const hasPhoneChangeFlow =
    targetPhoneDigits.length === 11 &&
    targetPhoneDigits !== registeredPhoneDigits;
  const helperPhoneDigits = hasPhoneChangeFlow
    ? targetPhoneDigits
    : registeredPhoneDigits;
  const helperPhoneLabel = "Telefone atual:";
  const subtitlePhone =
    targetPhoneMasked ||
    (targetPhoneDigits ? maskPhone(targetPhoneDigits) : "") ||
    "cadastrado";
  const isBusy = isLoading || loadingSubmit;
  const analyticsMode = screenMode ?? "verify_otp";

  useEffect(() => {
    setScreenMode(mode);
  }, [mode]);

  useEffect(() => {
    if (screenMode !== "verify_otp") return;
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screenMode, timer]);

  useEffect(() => {
    AnalyticsService.screen(DIVERGENCIA_SCREENS.OTP, {
      flow: ANALYTICS_FLOWS.DIVERGENCIA,
      mode: analyticsMode,
      has_phone_change_flow: hasPhoneChangeFlow,
    });
  }, [analyticsMode, hasPhoneChangeFlow]);

  const handleChangeOtp = (value: string) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleBack = () => {
    if (screenMode === "edit_phone") {
      setScreenMode("verify_otp");
      return;
    }

    if (back) {
      back();
      return;
    }

    router.push("/login");
  };

  const handleOpenPhoneEdition = () => {
    Keyboard.dismiss();
    const currentPhoneDigits =
      targetPhoneDigits || registeredPhoneDigits || initialPhone;
    setPhone(currentPhoneDigits);
    setPhoneBaselineDigits(String(currentPhoneDigits).replace(/\D/g, ""));
    setScreenMode("edit_phone");
  };

  const handleSavePhone = async () => {
    Keyboard.dismiss();
    if (!canSavePhone) {
      showWarning("Atenção", "Informe um telefone valido com DDD.");
      return;
    }

    if (phoneValueDigits === phoneBaselineDigits) {
      showWarning("Atenção", "Informe um telefone diferente do numero atual.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post(
        "/v1/analise/phone/otp",
        {
          telefone: phoneValueDigits,
        },
        withAnalytics({
          flow: ANALYTICS_FLOWS.DIVERGENCIA,
          source: DIVERGENCIA_ANALYTICS_SOURCES.PHONE_CHANGE_SEND_OTP,
          mode: analyticsMode,
        }),
      );
      const maskedPhone =
        response?.data?.data?.phone || maskPhone(phoneValueDigits);

      setTargetPhoneDigits(phoneValueDigits);
      setTargetPhoneMasked(maskedPhone);
      setOtp("");
      setTimer(30);
      setScreenMode("verify_otp");
      onPhoneSaved?.(phoneValueDigits);
      showSuccess(
        "Sucesso",
        response?.data?.message ||
          "Codigo de verificacao enviado para o novo numero.",
      );
    } catch (error: any) {
      showWarning("Erro", getPhoneOtpErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    Keyboard.dismiss();

    if (!otpDigits || otpDigits.length !== 6) {
      showWarning("Atenção", "Codigo OTP obrigatorio");
      return;
    }

    setIsLoading(true);
    try {
      if (hasPhoneChangeFlow) {
        const response = await api.put(
          "/v1/analise/phone/confirm",
          {
            otp: otpDigits,
          },
          withAnalytics({
            flow: ANALYTICS_FLOWS.DIVERGENCIA,
            source: DIVERGENCIA_ANALYTICS_SOURCES.PHONE_CHANGE_CONFIRM_OTP,
            mode: analyticsMode,
          }),
        );

        setData({
          ...(useRegisterStore.getState().data || {}),
          whatsapp: targetPhoneDigits,
        });

        setTargetPhoneDigits("");
        setTargetPhoneMasked(
          response?.data?.data?.whatsapp || maskPhone(targetPhoneDigits),
        );
        setOtp("");
        setTimer(0);
        showSuccess(
          "Sucesso",
          response?.data?.message ||
            "Numero alterado e validado. Voce ja pode enviar para analise.",
        );
        return;
      }

      await api.post(
        "/v1/analise/check",
        {
          otp: otpDigits,
        },
        withAnalytics({
          flow: ANALYTICS_FLOWS.DIVERGENCIA,
          source: DIVERGENCIA_ANALYTICS_SOURCES.CONFIRM_OTP,
          mode: analyticsMode,
        }),
      );
      setOtp("");
      await finalizeDivergenciaFlow();
    } catch (error: any) {
      showWarning(
        "Erro",
        hasPhoneChangeFlow
          ? getPhoneConfirmErrorMessage(error)
          : error?.response?.data?.message ||
              "Nao foi possivel confirmar o codigo.",
      );
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || isBusy) return;

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      if (hasPhoneChangeFlow) {
        await api.post(
          "/v1/analise/phone/otp",
          {
            telefone: targetPhoneDigits,
          },
          withAnalytics({
            flow: ANALYTICS_FLOWS.DIVERGENCIA,
            source: DIVERGENCIA_ANALYTICS_SOURCES.PHONE_CHANGE_RESEND_OTP,
            mode: analyticsMode,
          }),
        );
      } else {
        const { data } = await api.post(
          "/v1/analise/otp",
          {},
          withAnalytics({
            flow: ANALYTICS_FLOWS.DIVERGENCIA,
            source: DIVERGENCIA_ANALYTICS_SOURCES.RESEND_OTP,
            mode: analyticsMode,
          }),
        );
        console.log("resend", data);
      }
      setOtp("");
      setTimer(hasPhoneChangeFlow ? 30 : 45);
      showSuccess("Sucesso", "Codigo enviado com sucesso.");
    } catch (error: any) {
      showWarning(
        "Erro",
        hasPhoneChangeFlow
          ? getPhoneOtpErrorMessage(error)
          : error?.response?.data?.message ||
              "Nao foi possivel reenviar o codigo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loadingSubmit) {
    return (
      <>
        <AlertDisplay />
        <PulsingImageLoader
          source={require("@/assets/images/logo-verde.png")}
          text="Finalizando cadastro..."
        />
      </>
    );
  }

  if (screenMode === "edit_phone") {
    return (
      <View style={styles.container}>
        <AlertDisplay />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={require("@/assets/images/logo-verde.png")}
                resizeMode="cover"
                style={styles.logo}
              />

              <View style={styles.content}>
                <Text style={styles.title}>Alterar telefone</Text>

                <Text style={styles.subtitle}>
                  Informe o novo numero com DDD. O codigo de verificacao sera
                  enviado para esse telefone para concluir a alteracao.
                </Text>

                {helperPhoneDigits ? (
                  <Text style={styles.helperText}>
                    {helperPhoneLabel}{" "}
                    <Text style={styles.helperTextStrong}>
                      {maskPhone(helperPhoneDigits)}
                    </Text>
                  </Text>
                ) : null}

                <View style={styles.card}>
                  <InputComponent
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    maskType="cellphone"
                    error={phoneError}
                    returnKeyType="done"
                    onSubmitEditing={handleSavePhone}
                    icon={
                      <Ionicons
                        name="call-outline"
                        size={18}
                        color={Colors.gray.primary}
                      />
                    }
                  />
                </View>

                <ButtonComponent
                  title="Salvar telefone"
                  onPress={handleSavePhone}
                  loading={isBusy}
                  iconLeft={null}
                  iconRight={null}
                  disabled={!canSavePhone || isBusy}
                />

                <View style={styles.loginRow}>
                  <TouchableOpacity onPress={handleBack} activeOpacity={0.8}>
                    <Text style={styles.loginAction}>Voltar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlertDisplay />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require("@/assets/images/logo-verde.png")}
              resizeMode="cover"
              style={styles.logo}
            />

            <View style={styles.content}>
              <Text style={styles.title}>Verificação</Text>

              <Text style={styles.subtitle}>
                Por seguranca, enviamos um codigo para o telefone{" "}
                <Text style={styles.subtitleStrong}>{subtitlePhone}</Text>.
                Digite o codigo para continuar.
              </Text>

              <View style={styles.card}>
                <InputComponent
                  value={otpDigits}
                  onChangeText={handleChangeOtp}
                  placeholder="Codigo de 6 digitos"
                  keyboardType="number-pad"
                  maskType="otp"
                  returnKeyType="done"
                  onSubmitEditing={handleConfirmCode}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  icon={
                    <Ionicons
                      name="key-outline"
                      size={18}
                      color={Colors.gray.primary}
                    />
                  }
                />

                <View style={styles.resendContainer}>
                  {timer > 0 ? (
                    <Text style={styles.infoText}>
                      Reenviar codigo em{" "}
                      <Text style={styles.infoTextStrong}>
                        {formatTimer(timer)}
                      </Text>
                    </Text>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleResendCode}
                      style={styles.resendButton}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.resendText,
                          isBusy && styles.resendTextDisabled,
                        ]}
                      >
                        Reenviar codigo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ButtonComponent
                title="Confirmar codigo"
                onPress={handleConfirmCode}
                loading={isBusy}
                iconLeft={null}
                iconRight="arrow-forward"
                disabled={!canSubmit || isBusy}
              />

              <View style={styles.secondaryButtonWrapper}>
                <ButtonComponent
                  title="Trocar telefone"
                  onPress={handleOpenPhoneEdition}
                  loading={isBusy}
                  iconLeft="call-outline"
                  iconRight={null}
                  disabled={isBusy}
                  outline
                />
              </View>

              {isBusy ? null : (
                <View style={styles.loginRow}>
                  <TouchableOpacity onPress={handleBack} activeOpacity={0.8}>
                    <Text style={styles.loginAction}>Voltar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backLinkContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  backLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.green.primary,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  content: {
    width: "100%",
    maxWidth: 420,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.green.primary,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray.text,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  subtitleStrong: {
    fontWeight: "700",
    color: Colors.black,
  },
  helperText: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: "center",
    marginBottom: 16,
  },
  helperTextStrong: {
    fontWeight: "700",
    color: Colors.black,
  },
  card: {
    width: "100%",
    marginBottom: 20,
  },
  secondaryButtonWrapper: {
    width: "100%",
    marginVertical: 16,
  },
  resendContainer: {
    marginTop: 6,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minHeight: 26,
  },
  infoText: {
    fontSize: 13,
    color: Colors.gray.text,
    textAlign: "center",
  },
  infoTextStrong: {
    fontWeight: "700",
    color: Colors.black,
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.green.primary,
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: Colors.gray.primary,
    textDecorationLine: "none",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
  },
  loginText: {
    fontSize: 15,
    color: Colors.gray.text,
  },
  loginAction: {
    fontSize: 15,
    color: Colors.green.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
