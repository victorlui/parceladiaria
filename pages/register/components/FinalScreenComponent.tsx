import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Props {
  complete: () => void;
}

const FinalScreenComponent: React.FC<Props> = ({ complete }) => {
  const completeRegistration = () => {
    complete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Background decorativo fluido */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <FontAwesome name="check" size={48} color={Colors.white} />
        </View>

        <Text style={styles.title}>Cadastro Realizado!</Text>

        <Text style={styles.description}>
          Entre para finalizar a solicitação do empréstimo.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonComponent
          title="Entrar"
          iconLeft="home"
          iconRight={null}
          onPress={completeRegistration}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Substitua por Colors.background se tiver
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 40 : 60,
    paddingBottom: 40,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.green.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,

    // Sombra suave para dar profundidade (Glow effect)
    shadowColor: Colors.green.secondary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },

  description: {
    fontSize: 16,
    color: Colors.gray.primary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  buttonContainer: {
    width: "100%",
    marginTop: "auto",
  },

  circleTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.05)", // 5% de opacidade para ficar sutil
  },

  circleBottom: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.03)",
  },
});

export default FinalScreenComponent;
