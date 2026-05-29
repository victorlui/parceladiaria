import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/auth";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { useRegisterStore } from "@/store/register_new";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import ButtonChat from "../ui/ButtonChat";

const ChamadaVideoScreen: React.FC = () => {
  const { logout } = useAuthStore((state) => state);
  const { data: registerData } = useRegisterStore();
  const { user } = useAuthStore();
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [call, setCall] = useState<{
    expira_minutos: number;
    url: string;
  } | null>(null);

  const callExpiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const requestPermissions = React.useCallback(async () => {
    try {
      // ANDROID
      if (Platform.OS === "android") {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Permissão da câmera",
            message:
              "Precisamos acessar sua câmera para realizar a videochamada.",
            buttonPositive: "Permitir",
            buttonNegative: "Cancelar",
          },
        );

        const microphonePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Permissão do microfone",
            message:
              "Precisamos acessar seu microfone para realizar a videochamada.",
            buttonPositive: "Permitir",
            buttonNegative: "Cancelar",
          },
        );

        const granted =
          cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
          microphonePermission === PermissionsAndroid.RESULTS.GRANTED;

        setHasPermissions(granted);

        if (!granted) {
          Alert.alert(
            "Permissões necessárias",
            "Permita câmera e microfone para continuar.",
            [
              {
                text: "Abrir configurações",
                onPress: () => Linking.openSettings(),
              },
              {
                text: "Cancelar",
                style: "cancel",
              },
            ],
          );
        }

        return;
      }

      // IOS
      setHasPermissions(true);
    } catch (error) {
      setHasPermissions(false);
    }
  }, []);

  React.useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const onExit = () => {
    // if (callExpiryTimeoutRef.current) {
    //   clearTimeout(callExpiryTimeoutRef.current);
    //   callExpiryTimeoutRef.current = null;
    // }

    logout();
    router.replace("/login");
  };

  const onLeaveCall = () => {
    logout();
    router.replace("/login");
  };

  const fetchChamada = React.useCallback(async () => {
    const telefoneFinal =
      registerData?.whatsapp ||
      registerData?.phone ||
      user?.whatsapp ||
      user?.phone ||
      "";

    const { data } = await axios.post(
      "https://cadastroparceladiaria.com.br/api/chamada-app",
      {
        cpf: registerData?.cpf || user?.cpf || "",
        nome: registerData?.nome || user?.nome || "",
        telefone: telefoneFinal,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return data as {
      expira_minutos: number;
      url: string;
    };
  }, [
    registerData?.cpf,
    registerData?.nome,
    registerData?.whatsapp,
    registerData?.phone,
    user?.cpf,
    user?.nome,
    user?.whatsapp,
    user?.phone,
  ]);

  const onRequestChamada = React.useCallback(async () => {
    try {
      if (!hasPermissions) {
        await requestPermissions();
        return;
      }
      setIsLoading(true);
      const data = await fetchChamada();
      setCall(data);
    } catch (error) {
      const nomeUsuario =
        (registerData?.nome || user?.nome)?.split(" ")[0] || "Usuário";
      let description = `${nomeUsuario}, tente novamente em instantes.`;

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data as any;
        const serverMessage = responseData?.message;

        if (status === 400) {
          const details =
            typeof responseData === "object"
              ? JSON.stringify(responseData)
              : responseData;
          description = `Erro 400: ${serverMessage || details || "Dados inválidos."}`;
        } else if (typeof serverMessage === "string" && serverMessage.trim()) {
          description = serverMessage;
        } else if (status) {
          description = `Erro ${status}. ${nomeUsuario}, tente novamente em instantes.`;
        } else if (error.code === "ECONNABORTED") {
          description = `Timeout. ${nomeUsuario}, verifique sua internet e tente novamente.`;
        } else if (!error.response) {
          description = `Erro de conexão. ${nomeUsuario}, verifique sua internet e tente novamente.`;
        }
      } else {
        if (error instanceof Error && error.message) {
          description = error.message;
        }
      }

      Alert.alert("Não foi possível iniciar a chamada", description);
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchChamada,
    hasPermissions,
    requestPermissions,
    registerData?.nome,
    user?.nome,
  ]);

  const onRefreshChamadaAfterExpiry = React.useCallback(async () => {
    try {
      const data = await fetchChamada();
      setCall(data);
    } catch (error) {
      setCall(null);

      let errorDetails = "";
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const responseData = error.response.data;
        errorDetails = `\nDetalhes (400): ${typeof responseData === "object" ? JSON.stringify(responseData) : responseData}`;
      }

      Alert.alert(
        "Link expirado",
        `O link expirou e não foi possível gerar um novo agora. Tente novamente.${errorDetails}`,
      );
    }
  }, [fetchChamada]);

  React.useEffect(() => {
    if (!call) return;

    if (callExpiryTimeoutRef.current) {
      clearTimeout(callExpiryTimeoutRef.current);
      callExpiryTimeoutRef.current = null;
    }

    const expirationMs = Math.max(0, call.expira_minutos) * 60 * 1000;

    callExpiryTimeoutRef.current = setTimeout(() => {
      Alert.alert(
        "Link expirado",
        "O link da chamada expirou. Gerando um novo link agora.",
      );

      onRefreshChamadaAfterExpiry();
    }, expirationMs);

    return () => {
      if (callExpiryTimeoutRef.current) {
        clearTimeout(callExpiryTimeoutRef.current);
        callExpiryTimeoutRef.current = null;
      }
    };
  }, [call, onRefreshChamadaAfterExpiry]);

  if (call) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webviewContainer}>
          {hasPermissions ? (
            <WebView
              key={call.url}
              source={{ uri: call.url }}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              allowsFullscreenVideo
              mixedContentMode="always"
              mediaCapturePermissionGrantType="grant"
              androidLayerType="hardware"
              setSupportMultipleWindows={false}
              cacheEnabled={false}
              thirdPartyCookiesEnabled
              sharedCookiesEnabled
              onPermissionRequest={(event: any) => {
                event.grant(event.resources);
              }}
            />
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionTitle}>
                Não foi possível acessar a câmera/microfone
              </Text>

              <Text style={styles.permissionSubtitle}>
                Autorize as permissões e tente novamente.
              </Text>

              <TouchableOpacity
                onPress={requestPermissions}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.infoText}>
            Não saia desta tela até o final da chamada para evitar desconexão.
          </Text>

          <TouchableOpacity
            onPress={onLeaveCall}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7FCFA" }}>
      <View style={styles.preAprovadoContainer}>
        <View style={{ alignItems: "center", gap: 24 }}>
          <FontAwesome
            name="check-circle"
            size={80}
            color={Colors.green.primary}
          />

          <View style={styles.preAprovadoPill}>
            <View style={styles.preAprovadoPillDot} />

            <Text style={styles.preAprovadoPillText}>PRÉ-APROVADO</Text>
          </View>

          <Text style={styles.preAprovadoTitle}>
            Seu empréstimo está pré-aprovado!
          </Text>

          <Text style={styles.subtitlePreAprovado}>
            Está tudo certo até aqui. Como última etapa, precisamos realizar uma
            chamada de vídeo rápida para confirmar algumas informações.
          </Text>

          <View style={styles.timeContainer}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  marginBottom: 12,
                }}
              >
                <FontAwesome
                  name="clock-o"
                  size={16}
                  color={Colors.green.primary}
                  style={{ marginLeft: 18 }}
                />

                <Text style={styles.timeTitle}>
                  Atendimento em horário comercial
                </Text>
              </View>

              <Text style={styles.timeText}>De 08:30 às 18:00</Text>
            </View>
          </View>
        </View>

        {/* <ButtonChat botton={320} /> */}

        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={onRequestChamada}
            style={styles.whatsappButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <FontAwesome name="whatsapp" size={20} color={Colors.white} />
                <Text style={styles.whatsappButtonText}>
                  Fazer a video chamada
                </Text>
                <FontAwesome
                  name="arrow-right"
                  size={16}
                  color={Colors.white}
                />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLeaveCall}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ButtonChat botton={200} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FCFA",
  },

  webviewContainer: {
    flex: 1,
    overflow: "hidden",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },

  permissionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },

  permissionSubtitle: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: "center",
    lineHeight: 20,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },

  infoText: {
    color: Colors.gray.text,
    textAlign: "center",
    fontSize: 12,
  },

  secondaryButtonText: {
    color: Colors.gray.text,
    fontWeight: "bold",
    fontSize: 16,
  },

  primaryButton: {
    backgroundColor: Colors.green.button,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  preAprovadoContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },

  preAprovadoPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 99,
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 6,
  },

  preAprovadoPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green.primary,
  },

  preAprovadoPillText: {
    color: Colors.green.primary,
    fontWeight: "bold",
    fontSize: 12,
  },

  preAprovadoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },

  subtitlePreAprovado: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: "center",
    lineHeight: 20,
  },

  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: "100%",
  },

  timeTitle: {
    color: Colors.gray.text,
    fontSize: 14,
    textAlign: "center",
  },

  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },

  whatsappButton: {
    backgroundColor: Colors.green.button,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  whatsappButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ChamadaVideoScreen;
