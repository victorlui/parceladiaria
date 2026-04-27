import React, { useRef, useState } from "react";
import { Colors } from "@/constants/Colors";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { router } from "expo-router";
import { WebView } from "react-native-webview";
import { Camera } from "react-native-vision-camera";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";

const ChamadaVideoScreen: React.FC = () => {
  const { logout, user, userRegister } = useAuthStore((state) => state);
  const [hasPermissions, setHasPermissions] = React.useState<boolean | null>(
    null,
  );
  const [call, setCall] = useState<{
    expira_minutos: number;
    url: string;
  } | null>(null);
  const callExpiryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const requestPermissions = React.useCallback(async () => {
    try {
      const cameraStatus = await Camera.requestCameraPermission();
      const micStatus = await Camera.requestMicrophonePermission();

      const allowed = cameraStatus === "granted" && micStatus === "granted";
      setHasPermissions(allowed);

      if (!allowed) {
        Alert.alert(
          "Permissão necessária",
          "Para realizar a chamada de vídeo, autorize Câmera e Microfone nas configurações do app.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir Configurações",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } catch {
      setHasPermissions(false);
    }
  }, []);

  React.useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  const onExit = () => {
    if (callExpiryTimeoutRef.current) {
      clearTimeout(callExpiryTimeoutRef.current);
      callExpiryTimeoutRef.current = null;
    }
    logout();
    router.replace("/login");
  };

  const fetchChamada = React.useCallback(async () => {
    const cpf = user?.cpf || userRegister?.cpf;
    const { data } = await axios.post(
      "https://cadastroparceladiaria.com.br/api/chamada-app",
      {
        cpf,
        nome: user?.nome || userRegister?.nome || "",
        telefone: user?.phone || userRegister?.phone || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return data as { expira_minutos: number; url: string };
  }, [
    user?.cpf,
    userRegister?.cpf,
    user?.nome,
    user?.phone,
    userRegister?.nome,
    userRegister?.phone,
  ]);

  const onRequestChamada = React.useCallback(async () => {
    try {
      const data = await fetchChamada();
      setCall(data);
    } catch {
      Alert.alert(
        "Não foi possível iniciar a chamada",
        "Tente novamente em instantes.",
      );
    }
  }, [fetchChamada]);

  const onRefreshChamadaAfterExpiry = React.useCallback(async () => {
    try {
      const data = await fetchChamada();
      setCall(data);
    } catch {
      setCall(null);
      Alert.alert(
        "Link expirado",
        "O link expirou e não foi possível gerar um novo agora. Tente novamente.",
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
              injectedJavaScriptBeforeContentLoaded={`
    (function() {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices
      );

      navigator.mediaDevices.getUserMedia = async function(constraints) {
        console.log('constraints originais', constraints);

        // força apenas vídeo
        return originalGetUserMedia({
          video: true,
          audio: true,
        });
      };
    })();

    true;
  `}
              allowsFullscreenVideo
              mixedContentMode="always"
              mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
              androidLayerType="hardware"
              setSupportMultipleWindows={false}
              onPermissionRequest={(event: any) => {
                if (Platform.OS === "android") {
                  event.grant(event.resources);
                }
              }}
            />
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionTitle}>
                Não foi possível acessar a câmera/microfone
              </Text>
              <Text style={styles.permissionSubtitle}>
                Autorize as permissões e tente novamente. Se continuar falhando,
                abra no navegador do celular.
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
          <TouchableOpacity onPress={onExit} style={styles.secondaryButton}>
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
            chamada de vídeo rápida para confirmar algumas informações. Clique
            no link abaixo para falar com um especialista. Nosso time estará
            pronto para te atender.
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

        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={onRequestChamada}
            style={styles.whatsappButton}
          >
            <FontAwesome name="whatsapp" size={20} color={Colors.white} />
            <Text style={styles.whatsappButtonText}>
              Falar com um Atendente
            </Text>
            <FontAwesome name="arrow-right" size={16} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onExit} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
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
