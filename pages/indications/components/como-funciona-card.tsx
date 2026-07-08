import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type ComoFuncionaCardProps = {
  showRelerTermosButton?: boolean;
  onPressRelerTermos?: () => void;
  hasV3?: boolean;
};

const stepsV3 = [
  "💳 Pague a 1ª parcela do seu contrato e ganhe 5 convites",
  "📩 Compartilhe seu link com amigos",
  "💰 Amigo aprovado = R$ 50,00 no seu PIX",
  "🔄 Renove e abra +5 convites",
];

const stepsLegacy = [
  "📤 Compartilhe seu link com amigos",
  "📋 O amigo se cadastra pelo seu link",
  "✅ Se for aprovado",
  "💰 Você recebe R$ 50,00 e saca quando quiser",
];

export default function ComoFuncionaCard({
  showRelerTermosButton = false,
  onPressRelerTermos,
  hasV3 = true,
}: ComoFuncionaCardProps) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const steps = hasV3 ? stepsV3 : stepsLegacy;

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name="information-circle"
          size={width < 360 ? 22 : width < 430 ? 24 : 28}
          color={Colors.primaryColor}
        />
        <Text style={styles.sectionTitle}>Como funciona</Text>
      </View>

      <View style={styles.steps}>
        {steps.map((step) => (
          <Text key={step} style={styles.stepItem}>
            {step}
          </Text>
        ))}
      </View>

      {showRelerTermosButton && (
        <Pressable onPress={onPressRelerTermos} style={styles.termsButton}>
          <Ionicons
            name="document-text-outline"
            size={width < 360 ? 18 : 20}
            color={Colors.primaryColor}
          />
          <Text style={styles.termsButtonText}>Reler termos do programa</Text>
        </Pressable>
      )}
    </View>
  );
}

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  const horizontalPadding = isSmallDevice ? 18 : isMediumDevice ? 20 : 24;
  const verticalPadding = isSmallDevice ? 20 : isMediumDevice ? 24 : 28;
  const bodySize = isSmallDevice ? 14 : isMediumDevice ? 15 : 17;
  const sectionTitleSize = isSmallDevice ? 18 : isMediumDevice ? 20 : 22;
  const bodyLineHeight = isSmallDevice ? 23 : isMediumDevice ? 25 : 30;

  return StyleSheet.create({
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
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: isSmallDevice ? 16 : 20,
    },
    sectionTitle: {
      color: "#233047",
      fontSize: sectionTitleSize,
      fontWeight: "700",
    },
    steps: {
      gap: isSmallDevice ? 10 : 14,
    },
    stepItem: {
      color: "#2C3748",
      fontSize: bodySize,
      lineHeight: bodyLineHeight,
    },
    termsButton: {
      flex: 1,

      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      flexDirection: "row",
      borderWidth: 1,
      borderColor: Colors.borderColor,
      marginTop: 15,
    },
    termsButtonPressed: {
      opacity: 0.85,
    },
    termsButtonText: {
      color: "#233047",
      fontSize: isSmallDevice ? 13 : 14,
      fontWeight: "600",
    },
  });
};
