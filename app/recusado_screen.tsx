import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { useDisableBackHandler } from "@/hooks/useDisabledBackHandler";
import { useAuthStore } from "@/store/auth";
import { formatDateToBR } from "@/utils/formats";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RecusadoScreen: React.FC = () => {
  useDisableBackHandler();
  const { logout, userRegister } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />

      <View style={styles.card}>
        <FontAwesome name="times-circle" size={80} color="red" />
        <Text style={styles.title}>Recusado</Text>
        <Text style={styles.subtitle}>
          Infelizmente, não foi posívvel aprovar seu cadastro no momento.
        </Text>
      </View>

      <View style={styles.motivoRecusa}>
        <Text style={styles.titleMotivoRecusa}>Motivo da Recusa</Text>
        <Text style={styles.textMotivoRecusa}>
          {userRegister?.motivo_recusa}
        </Text>
      </View>

      {userRegister?.data_retentativa && (
        <View style={styles.motivoRecusa}>
          <Text style={styles.titleMotivoRecusa}>Nova tentativa</Text>
          <Text style={styles.textMotivoRecusa}>
            Você poderá solicitar novamente a partir de{" "}
            <Text style={{ fontWeight: "600" }}>
              {formatDateToBR(userRegister?.data_retentativa)}
            </Text>
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          logout();
          router.replace("/login");
        }}
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    margin: 20,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "300",
    color: Colors.gray.text,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    margin: 20,
    borderWidth: 1,
    borderColor: Colors.gray.primary,
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
  },
  motivoRecusa: {
    margin: 20,
    width: "100%",
    backgroundColor: "#EFF7F9",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  titleMotivoRecusa: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
  },
  textMotivoRecusa: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray.text,
  },
});

export default RecusadoScreen;
