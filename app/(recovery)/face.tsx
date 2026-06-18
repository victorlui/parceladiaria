import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { uploadRawFileToSignedUrl } from "@/hooks/useUploadDocument";
import FaceCaptureWebView from "@/pages/face/components/FaceCaptureWebView";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useRegisterStore } from "@/store/register_new";
import { maskCpf } from "@/utils/mask";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOGO_SOURCE = require("@/assets/images/logo-verde.png");
const DEFAULT_MASKED_CPF = "123.456.789-00";

type RecoveryUploadUrlResponse = {
  data?: {
    upload_url?: string;
  };
};

type FaceCapturePayload = {
  file?: string;
};

type FaceRecoveryResponse =
  | {
      status: "verified";
      score?: number;
      id: number;
      token: string;
      token_type?: string;
      name: string;
    }
  | {
      status: "retry";
      remaining?: number;
      score?: number;
    }
  | {
      status: "question";
    };

const FaceScreen: React.FC = () => {
  const { showWarning } = useAlerts();
  const cpfValid = useAuthStore((state) => state.cpfValid);
  const setCpfValid = useAuthStore((state) => state.setCpfValid);
  const registerRecovery = useAuthStore((state) => state.register);
  const registerData = useRegisterStore((state) => state.data);
  const setRegisterData = useRegisterStore((state) => state.setData);
  const setRegisterToken = useRegisterStore((state) => state.setToken);

  const displayedCpf = useMemo(
    () => maskCpf(cpfValid ?? undefined) || DEFAULT_MASKED_CPF,
    [cpfValid],
  );
  const [isFace, setIsFace] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [urlUpload, setUrlUpload] = useState("");
  const [isLoadingUploadUrl, setIsLoadingUploadUrl] = useState(false);
  const [isSubmittingFace, setIsSubmittingFace] = useState(false);

  const getErrorMessage = useCallback((error: unknown) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: { message?: string } } }).response
        ?.data?.message === "string"
    ) {
      return (error as { response?: { data?: { message?: string } } }).response
        ?.data?.message as string;
    }

    return "Ocorreu um erro ao enviar a foto.";
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const handleCloseFace = useCallback(() => {
    if (isSubmittingFace) {
      return;
    }

    setIsFace(false);
  }, [isSubmittingFace]);

  const restartRecoveryFlow = useCallback(
    (redirectTo: "/(recovery)/cpf" | "/login" = "/(recovery)/cpf") => {
      setIsFace(false);
      setIsVerified(false);
      setUrlUpload("");
      setCpfValid(null);
      setRegisterToken(null);
      registerRecovery(null, null);
      router.replace(redirectTo);
    },
    [registerRecovery, setCpfValid, setRegisterToken],
  );

  const handleContinue = useCallback(async () => {
    if (!cpfValid || isLoadingUploadUrl) {
      if (!cpfValid) {
        showWarning("Erro", "CPF invalido. Volte e informe um CPF valido.");
      }
      return;
    }

    setIsLoadingUploadUrl(true);
    try {
      const { data } = await api.post<RecoveryUploadUrlResponse>(
        "/auth/recovery/upload-url",
        {
          cpf: cpfValid,
        },
      );
      const uploadUrl = data?.data?.upload_url;

      if (!uploadUrl) {
        showWarning(
          "Erro",
          "Nao foi possivel preparar o envio da selfie. Tente novamente.",
        );
        return;
      }

      setUrlUpload(uploadUrl);
      setIsFace(true);
    } catch (error: unknown) {
      showWarning("Erro", getErrorMessage(error));
    } finally {
      setIsLoadingUploadUrl(false);
    }
  }, [cpfValid, getErrorMessage, isLoadingUploadUrl, showWarning]);

  const handleProceedToChangePassword = useCallback(() => {
    router.replace("/(recovery)/change-password");
  }, []);

  const sendPhoto = useCallback(
    async (photoData: FaceCapturePayload) => {
      if (!cpfValid) {
        showWarning("Erro", "CPF invalido. Volte e informe um CPF valido.");
        return;
      }

      if (!urlUpload) {
        showWarning(
          "Erro",
          "Nao foi possivel identificar a URL de upload da selfie.",
        );
        return;
      }

      if (!photoData?.file || isSubmittingFace) {
        return;
      }

      setIsFace(false);
      setIsSubmittingFace(true);
      try {
        const finalUrl = await uploadRawFileToSignedUrl(
          photoData.file,
          urlUpload,
        );
        const { data } = await api.post<{
          success: boolean;
          data?: FaceRecoveryResponse;
        }>("/auth/recovery/face", {
          selfie: finalUrl,
          cpf: cpfValid,
        });
        const responseData = data?.data;

        if (responseData?.status === "verified") {
          setRegisterToken(responseData.token ?? null);
          registerRecovery(responseData.token, null);
          setRegisterData({
            ...(registerData ?? {}),
            cpf: cpfValid,
            id: responseData.id,
            nome: responseData.name,
          });
          setIsFace(false);
          setIsVerified(true);
          return;
        }

        if (responseData?.status === "retry") {
          const remainingAttempts = responseData.remaining ?? 0;

          setIsFace(false);
          showWarning(
            "Selfie nao aprovada",
            remainingAttempts > 0
              ? `Nao foi possivel validar sua selfie. Voce ainda tem ${remainingAttempts} tentativa(s).`
              : "Nao foi possivel validar sua selfie. Tente novamente.",
            () => {
              setIsFace(true);
            },
          );
          return;
        }

        if (responseData?.status === "question") {
          setIsFace(false);
          router.push("/(recovery)/birthdate");
          return;
        }

        showWarning(
          "Erro",
          "Nao foi possivel concluir a validacao facial. Tente novamente.",
        );
      } catch (error: unknown) {
        const status =
          typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;

        if (status === 410) {
          showWarning(
            "Sessao expirada",
            "A sessao de recuperacao expirou. Reinicie o processo.",
            () => {
              restartRecoveryFlow();
            },
          );
          return;
        }

        showWarning("Erro", getErrorMessage(error));
      } finally {
        setIsSubmittingFace(false);
      }
    },
    [
      cpfValid,
      getErrorMessage,
      isSubmittingFace,
      registerData,
      registerRecovery,
      restartRecoveryFlow,
      setRegisterData,
      setRegisterToken,
      showWarning,
      urlUpload,
    ],
  );

  return (
    <SafeAreaView style={styles.container}>
      <FaceCaptureWebView
        visible={isFace}
        onSuccess={sendPhoto}
        onClose={handleCloseFace}
      />
      <View style={styles.screen}>
        <TouchableOpacity
          style={styles.backLinkContainer}
          activeOpacity={0.8}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={18} color={Colors.green.primary} />
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Image source={LOGO_SOURCE} resizeMode="cover" style={styles.logo} />
          <Text style={styles.title}>Parcela Diária</Text>
          {isSubmittingFace ? (
            <>
              <View style={styles.loadingCard}>
                <View style={styles.infoBadge}>
                  <FontAwesome
                    name="spinner"
                    size={18}
                    color={Colors.green.primary}
                  />
                  <Text style={styles.infoBadgeText}>Validando selfie</Text>
                </View>

                <Text style={styles.infoTitle}>
                  Estamos analisando sua foto
                </Text>
                <Text style={styles.infoDescription}>
                  Aguarde enquanto confirmamos sua identidade para seguir com a
                  redefinicao da senha.
                </Text>

                <View style={styles.cpfCard}>
                  <Text style={styles.cpfLabel}>CPF</Text>
                  <Text style={styles.cpfValue}>{displayedCpf}</Text>
                </View>
              </View>

              <ButtonComponent
                title="Validando"
                onPress={() => undefined}
                iconLeft={null}
                iconRight={null}
                loading
                disabled
              />
            </>
          ) : isVerified ? (
            <>
              <View style={styles.successCard}>
                <View style={styles.successBadge}>
                  <FontAwesome
                    name="check-circle"
                    size={18}
                    color={Colors.green.primary}
                  />
                  <Text style={styles.successBadgeText}>
                    Identidade confirmada
                  </Text>
                </View>

                <Text style={styles.infoTitle}>Tudo certo</Text>
                <Text style={styles.infoDescription}>
                  Vamos definir sua nova senha.
                </Text>

                <View style={styles.cpfCard}>
                  <Text style={styles.cpfLabel}>CPF confirmado</Text>
                  <Text style={styles.cpfValue}>{displayedCpf}</Text>
                </View>
              </View>

              <ButtonComponent
                title="Definir nova senha"
                onPress={handleProceedToChangePassword}
                iconLeft={null}
                iconRight="arrow-forward"
              />
            </>
          ) : (
            <>
              <View style={styles.infoCard}>
                <View style={styles.infoBadge}>
                  <FontAwesome
                    name="user-circle"
                    size={18}
                    color={Colors.green.primary}
                  />
                  <Text style={styles.infoBadgeText}>
                    Reconhecimento facial
                  </Text>
                </View>

                <Text style={styles.infoTitle}>Vamos confirmar e voce</Text>
                <Text style={styles.infoDescription}>
                  Como voce ja tem cadastro com selfie, vamos confirmar sua
                  identidade por reconhecimento facial.
                </Text>

                <View style={styles.cpfCard}>
                  <Text style={styles.cpfLabel}>CPF</Text>
                  <Text style={styles.cpfValue}>{displayedCpf}</Text>
                </View>
              </View>

              <ButtonComponent
                title="Continuar"
                onPress={handleContinue}
                iconLeft={null}
                iconRight="arrow-forward"
                loading={isLoadingUploadUrl}
                disabled={isLoadingUploadUrl || isSubmittingFace}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  screen: {
    flex: 1,
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
    alignSelf: "center",
    marginBottom: 16,
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.green.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray.text,
    textAlign: "center",
    marginBottom: 24,
  },
  infoCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  infoBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  infoBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.green.primary,
  },
  loadingCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  successCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    marginBottom: 20,
  },
  successBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  successBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.green.primary,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    lineHeight: 30,
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.gray.text,
    marginBottom: 20,
  },
  cpfCard: {
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  cpfLabel: {
    fontSize: 14,
    color: Colors.gray.text,
    marginBottom: 6,
  },
  cpfValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
});

export default FaceScreen;
