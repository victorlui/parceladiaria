import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StatusBar, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

interface Props {
  complete: () => void;
}

const FinalScreenComponent: React.FC<Props> = ({ complete }) => {
  const completeRegistration = () => {
    complete();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background decor */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <FontAwesome name="check" size={52} color={Colors.white} />
        </View>

        <Text style={styles.title}>Cadastro Concluído</Text>

        <Text style={styles.description}>
          Seu cadastro foi enviado com sucesso .
        </Text>

        <View style={styles.infoBox}>
          <FontAwesome
            name="clock-o"
            size={18}
            color={Colors.green.secondary}
          />

          <Text style={styles.infoText}>
            Em breve entraremos em contato com você.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="user" size={18} color={Colors.green.secondary} />

          <Text style={styles.infoText}>
            Você pode acompanhar o status pela área do cliente.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonComponent
          title="Entrar"
          iconLeft="home"
          iconRight={null}
          onPress={completeRegistration}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,

    elevation: 8,
  },

  iconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: Colors.green.secondary,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 24,

    shadowColor: Colors.green.secondary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,

    elevation: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: Colors.gray.primary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },

  infoBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,

    backgroundColor: "#F4FDF7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray.primary,
    lineHeight: 20,
  },

  buttonContainer: {
    marginTop: 28,
  },

  circleTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.08)",
  },

  circleBottom: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.05)",
  },
});

export default FinalScreenComponent;
