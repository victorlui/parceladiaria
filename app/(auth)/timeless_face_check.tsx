import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Network from "expo-network";
import { File } from "expo-file-system";
import { Camera } from "react-native-vision-camera";

import ButtonComponent from "@/components/ui/Button";
import FaceDetector from "@/components/FaceDetector";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { router } from "expo-router";

const TipItem: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <View style={styles.tipRow}>
    <LinearGradient
      style={styles.tipIcon}
      colors={[Colors.green.primary, "#28a999"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {icon}
    </LinearGradient>
    <Text style={styles.tipText}>{label}</Text>
  </View>
);

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.spinnerWrapper}>
      <ActivityIndicator size={140} color={Colors.green.primary} />
      <Image
        source={require("@/assets/images/logo.png")}
        style={styles.spinnerLogo}
        resizeMode="contain"
      />
    </View>

    <Text style={styles.loadingText}>Enviando imagem, favor aguarde...</Text>
  </View>
);

const TimelessFace: React.FC = () => {
  const { isPending } = useLoginMutation();
  const { cpf_valid, register } = useAuthStore((state) => state);
  const [showFaceDetector, setShowFaceDetector] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const requestPermission = async () => {
    const status = await Camera.requestCameraPermission();
    if (status === "denied") {
      Alert.alert(
        "Permissão necessária",
        "Você negou o acesso à câmera. Para usar esta função, ative a câmera nas Configurações.",
        [{ text: "OK", style: "cancel" }],
      );
    }

    setShowFaceDetector(true);
  };

  const sendPhoto = async (photo: string) => {
    const { isInternetReachable } = await Network.getNetworkStateAsync();
    if (isInternetReachable === false) {
      Alert.alert(
        "Sem conexão",
        "Verifique sua conexão com a internet e tente novamente.",
      );
      return;
    }

    setIsLoading(true);

    try {
      // garante que tenha file://
      const formattedUri = photo.startsWith("file://")
        ? photo
        : `file://${photo}`;

      const file = new File(formattedUri);

      const base64 = await file.base64();
      const base64WithPrefix = `data:image/jpeg;base64,${base64}`;

      const data = {
        cpf: cpf_valid,
        selfie: base64WithPrefix,
      };

      const response = await api.post("auth/verify-identity", data);
      register(response.data.data.token, {
        cpf: response.data.data.cpf,
        nome: response.data.data.nome,
        pixKey: "",
      });
      router.push("/(auth)/change-password-screen");
    } catch (error: any) {
      const { isInternetReachable } = await Network.getNetworkStateAsync();
      if (isInternetReachable === false) {
        Alert.alert(
          "Conexão perdida",
          "Sua internet caiu durante o envio. Verifique a conexão e tente novamente.",
        );
      } else if (
        error.response &&
        error.response.data.message === "Biometria facial não confirmada."
      ) {
        Alert.alert("Erro", "Biometria facial não confirmada.");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao enviar a foto.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isLoading && (
        <>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarOuter}>
              <LinearGradient
                style={styles.avatarInner}
                colors={[Colors.green.primary, "#28a999"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={32} color="#fff" />
              </LinearGradient>
            </View>
          </View>
          <View>
            <Text style={styles.title}>Vamos tirar sua foto</Text>
            <Text style={styles.subtitle}>
              Siga as instruções para garantir uma foto perfeita
            </Text>
          </View>
          <View style={styles.card}>
            <TipItem
              icon={<Ionicons name="bulb-outline" size={20} color="#fff" />}
              label="Ambiente bem iluminado"
            />
            <TipItem
              icon={<FontAwesome5 name="glasses" size={18} color="#fff" />}
              label="Retire óculos e acessórios"
            />
            <TipItem
              icon={<Ionicons name="happy-outline" size={20} color="#fff" />}
              label="Expressão neutra"
            />
            <TipItem
              icon={
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color="#fff"
                />
              }
              label="Celular firme e estável"
            />
          </View>
          <ButtonComponent
            title="Fazer Reconhecimento Facial"
            iconLeft="camera"
            iconRight={null}
            onPress={requestPermission}
          />
          {showFaceDetector && <FaceDetector takePhoto={sendPhoto} />}
        </>
      )}

      {(isLoading || isPending) && <LoadingScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "space-evenly",
  },
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
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 1,
  },
  avatarOuter: {
    width: 120,
    height: 120,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BEE4DF",
    padding: 6,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.gray.primary,
    textAlign: "center",
  },
  card: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
    padding: 8,
    borderRadius: 50,
  },
  tipText: {
    fontSize: 14,
  },
});

export default TimelessFace;
