import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { uploadRawFile } from "@/hooks/useUploadDocument";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useSettingsStore } from "@/store/settings";
import { Etapas } from "@/utils";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Network from "expo-network";
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FaceCaptureWebView from "./components/FaceCaptureWebView";
import LoadingScreen from "./components/LoadingScreen";
import TipItem from "./components/TipItem";

const FaceRecognitionScreen: React.FC = () => {
  const { mutateAsync: updateUser, isPending } = useUpdateUserMutation();
  const { user, userRegister, tokenRegister } = useAuthStore();
  const { openfinance } = useSettingsStore((state) => state);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSendingPhoto, setIsSendingPhoto] = useState(false);
  const isSendingPhotoRef = useRef(false);

  const sendPhoto = async (photoData: any) => {
    if (isSendingPhotoRef.current) {
      return;
    }

    isSendingPhotoRef.current = true;
    setIsSendingPhoto(true);
    setLoading(true);

    try {
      if (!photoData?.file) {
        Alert.alert("Erro", "Não foi possível obter a foto. Tente novamente.");
        return;
      }

      const { isInternetReachable } = await Network.getNetworkStateAsync();
      if (isInternetReachable === false) {
        Alert.alert(
          "Sem conexão",
          "Verifique sua conexão com a internet e tente novamente.",
        );
        return;
      }

      setOpen(false);

      const finalUrl = await uploadRawFile(photoData.file);

      const profissao = userRegister?.profissao || user?.profissao;

      if (profissao === "Comerciante") {
        await updateUser({
          request: {
            etapa: openfinance?.openfinance.comerciante.connect
              ? Etapas.OPEN_FINANCE
              : Etapas.ACEITANDO_TERMOS,
            face: finalUrl,
          },
        });
        return;
      }

      if (profissao === "Motorista" || profissao === "Motoboy") {
        if (openfinance?.openfinance.motorista.eco) {
          await api.get(`/v1/klavi`, {
            headers: {
              Authorization: `Bearer ${tokenRegister}`,
            },
          });
        }
        await updateUser({
          request: {
            etapa: openfinance?.openfinance.motorista.connect
              ? Etapas.OPEN_FINANCE
              : Etapas.ACEITANDO_TERMOS,
            face: finalUrl,
          },
        });
        return;
      }

      Alert.alert(
        "Erro",
        "Não foi possível finalizar o envio. Tente novamente.",
      );
    } catch (error: any) {
      if (error?.response?.status === 401) return;
      Alert.alert("Erro", "Não foi possível enviar a foto. Tente novamente.");
    } finally {
      isSendingPhotoRef.current = false;
      setIsSendingPhoto(false);
      setLoading(false);
    }
  };

  if (isPending || loading || isSendingPhoto) {
    return <LoadingScreen />;
  }

  if (open) {
    return (
      <FaceCaptureWebView
        visible={open}
        onSuccess={(photo) => sendPhoto(photo)}
        onClose={() => {
          if (isSendingPhotoRef.current) {
            return;
          }

          setOpen(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <Ionicons name="phone-portrait-outline" size={20} color="#fff" />
          }
          label="Celular firme e estável"
        />
      </View>
      <ButtonComponent
        title="Fazer Reconhecimento Facial"
        iconLeft="camera"
        iconRight={null}
        onPress={() => setOpen(true)}
      />
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
});

export default FaceRecognitionScreen;
