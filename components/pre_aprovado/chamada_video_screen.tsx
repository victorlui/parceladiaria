import React from "react";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { router } from "expo-router";

const ChamadaVideoScreen: React.FC = () => {
  const { logout } = useAuthStore((state) => state);

  const openWeb = async () => {
    const url = "https://cadastroparceladiaria.com.br/cliente/";
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      logout();
      router.replace("/login");
    } else {
      alert("Navegador não está instalado.");
    }
  };

  const onExit = () => {
    logout();
    router.replace("/login");
  };

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
          <TouchableOpacity onPress={openWeb} style={styles.whatsappButton}>
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
  secondaryButtonText: {
    color: Colors.gray.text,
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
});

export default ChamadaVideoScreen;
