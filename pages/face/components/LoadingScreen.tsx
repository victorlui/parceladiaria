import { Colors } from "@/constants/Colors";
import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

// import { Container } from './styles';

const LoadingScreen: React.FC = () => {
  return (
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
};

const styles = StyleSheet.create({
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
});

export default LoadingScreen;
