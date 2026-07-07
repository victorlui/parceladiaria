import { Colors } from "@/constants/Colors";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ComoFuncionaCard from "./como-funciona-card";

export default function RequisitosIndications() {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#233047" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <FontAwesome
              name="group"
              size={width < 360 ? 18 : 20}
              color={Colors.green.secondary}
            />
            <Text style={styles.title}>Programa de indicação</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <FontAwesome5
              name="hand-holding-usd"
              size={width < 360 ? 34 : width < 430 ? 38 : 42}
              color={Colors.green.secondary}
            />
          </View>
          <Text style={styles.heroTitle}>
            No Parcela Diária, sua indicação vale dinheiro.
          </Text>
          <Text style={styles.heroText}>
            Pague a <Text style={styles.heroTextBold}>1ª parcela</Text> do seu
            contrato e libere <Text style={styles.heroTextBold}>5 vagas</Text>{" "}
            de indicação.
          </Text>
          <Text style={styles.heroText}>
            Ganhe <Text style={styles.heroTextBold}>R$ 50,00</Text> por cada
            amigo aprovado, direto no seu PIX.
          </Text>
        </View>
        <ComoFuncionaCard />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  const horizontalPadding = isSmallDevice ? 18 : isMediumDevice ? 20 : 24;
  const verticalPadding = isSmallDevice ? 20 : isMediumDevice ? 24 : 28;
  const titleSize = isSmallDevice ? 17 : isMediumDevice ? 18 : 21;
  const bodySize = isSmallDevice ? 14 : isMediumDevice ? 15 : 17;
  const bodyLineHeight = isSmallDevice ? 23 : isMediumDevice ? 25 : 30;
  const titleLineHeight = isSmallDevice ? 26 : isMediumDevice ? 28 : 32;

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: Colors.white,
    },
    content: {
      paddingTop: isSmallDevice ? 18 : 24,
      gap: isSmallDevice ? 16 : 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 1,
    },
    headerSpacer: {
      width: 40,
    },
    title: {
      color: "#233047",
      fontSize: isSmallDevice ? 16 : isMediumDevice ? 17 : 19,
      fontWeight: "700",
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 26 : 28,
    },
    card: {
      backgroundColor: "#F1FAF8",
      borderRadius: isSmallDevice ? 22 : 26,
      paddingHorizontal: horizontalPadding,
      paddingVertical: verticalPadding,
      borderWidth: 1,
      borderColor: "#D7E1DF",
      shadowColor: "#053D39",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: isSmallDevice ? 16 : 20,
    },
    heroTitle: {
      marginTop: isSmallDevice ? 14 : 18,
      color: "#233047",
      fontSize: titleSize,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: titleLineHeight,
    },
    heroText: {
      marginTop: isSmallDevice ? 14 : 18,
      color: "#2C3748",
      fontSize: bodySize,
      textAlign: "center",
      lineHeight: bodyLineHeight,
    },
    heroTextBold: {
      fontWeight: "700",
    },
  });
};
