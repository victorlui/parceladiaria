import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
  Image,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Ionicons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "react-native-vision-camera";
import {
  useLoginDataMutation,
  useUpdateUserMutation,
} from "@/hooks/useRegisterMutation";
import { uploadFileToS3 } from "@/hooks/useUploadDocument";
import { Etapas } from "@/utils";
import ButtonComponent from "@/components/ui/Button";
import FaceDetector from "@/components/FaceDetector";
import { router } from "expo-router";
import { useRegisterNewStore } from "@/store/register_new";
import { useRegisterAuthStore } from "@/store/register";
import { useLoginMutation } from "@/hooks/useLoginMutation";

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
  const { data } = useRegisterNewStore();
  const { cpf, password } = useRegisterAuthStore();
  const { mutate } = useUpdateUserMutation();
  const { mutate: loginMutate, isPending } = useLoginMutation();
  const [showFaceDetector, setShowFaceDetector] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const requestPermission = async () => {
    const status = await Camera.requestCameraPermission();
    if (status === "denied") {
      Alert.alert(
        "Permissão necessária",
        "Você negou o acesso à câmera. Para usar esta função, ative a câmera nas Configurações.",
        [{ text: "OK", style: "cancel" }]
      );
    }

    setShowFaceDetector(true);
  };

  const completeRegistration = async () => {
    if (!password) {
      loginMutate({ cpf: cpf ?? "", password: data?.password ?? "" });
      return;
    }
    loginMutate({ cpf: cpf ?? "", password: password ?? "" });
  };

  const sendPhoto = async (photo: string) => {
    setIsLoading(true);

    try {
      const finalUrl = await uploadFileToS3({
        file: {
          uri: `file://${photo}`,
          name: `selfie-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
        },
      });
      mutate({
        request: {
          etapa: Etapas.FINALIZADO,
          face: finalUrl,
        },
      });
      setIsLoading(false);
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar foto:", error);
      Alert.alert("Erro", "Ocorreu um erro ao enviar a foto.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!isLoading && !isSuccess && (
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

      {!isLoading && isSuccess && (
        <>
          <View style={styles.successContainer}>
            <FontAwesome
              name="check-circle"
              size={100}
              color={Colors.green.secondary}
            />
            <Text style={styles.successTitle}>Cadastro Concluído</Text>
            <Text style={styles.successText}>
              Seu cadastro foi enviado com sucesso. Em breve entraremos em
              contato
            </Text>
          </View>
          <View style={{ marginTop: -180, width: "100%" }}>
            <ButtonComponent
              title="Entrar"
              iconLeft="home"
              iconRight={null}
              onPress={completeRegistration}
            />
          </View>
        </>
      )}
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
  successContainer: {
    alignItems: "center",
    gap: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.gray.primary,
    textAlign: "center",
  },
});

export default TimelessFace;
