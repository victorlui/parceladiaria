import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/auth";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AnaliseScreen: React.FC = () => {
  const { logout } = useAuthStore();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <Image
        source={require("@/assets/images/logo-verde.png")}
        style={styles.logo}
      />
      <View style={styles.card}>
        <FontAwesome5 name="hourglass-half" size={50} color="#f7ab09" />
        <Text style={styles.title}>Cadastro em análise</Text>
        <Text style={styles.subtitle}>
          Recebemos seus documentos e nossa equipe já está fazendo a validação.
          O processo pode levar ate 24 horas após o envio dos documentos.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          logout();
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
});

export default AnaliseScreen;
