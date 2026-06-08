import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function HeaderDivergente() {
  const checkProgress = 0.75;
  const checkRingSize = 64;
  const checkRingStrokeWidth = 6;
  const checkRingRadius = (checkRingSize - checkRingStrokeWidth) / 2;
  const checkRingCircumference = 2 * Math.PI * checkRingRadius;
  const checkRingDashoffset =
    checkRingCircumference * (1 - Math.max(0, Math.min(1, checkProgress)));
  return (
    <View style={styles.headerCard}>
      <View style={styles.headerPill}>
        <Text style={styles.headerPillText}>ETAPA 2 DE 2 · ÚLTIMA ETAPA</Text>
      </View>

      <View style={styles.headerIconCircle}>
        <Svg
          width={checkRingSize}
          height={checkRingSize}
          style={styles.headerIconRing}
        >
          <Circle
            cx={checkRingSize / 2}
            cy={checkRingSize / 2}
            r={checkRingRadius}
            stroke="#E6F4F1"
            strokeWidth={checkRingStrokeWidth}
            fill="none"
          />
          <Circle
            cx={checkRingSize / 2}
            cy={checkRingSize / 2}
            r={checkRingRadius}
            stroke={Colors.green.primary}
            strokeWidth={checkRingStrokeWidth}
            strokeDasharray={`${checkRingCircumference} ${checkRingCircumference}`}
            strokeDashoffset={checkRingDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${checkRingSize / 2} ${checkRingSize / 2})`}
          />
        </Svg>
        <FontAwesome5 name="check" size={26} color={Colors.green.primary} />
      </View>

      <Text style={styles.headerTitle}>
        Falta pouco pra concluir seu cadastro
      </Text>

      <Text style={styles.headerLabel}>O que falta:</Text>
      <View style={styles.headerBox}>
        <Text style={styles.headerBoxText}>
          Envie os documentos abaixo pra concluir seu cadastro.{" "}
          <Text style={styles.headerBoxTextBold}>
            O envio leva menos de 5 minutos.
          </Text>
        </Text>
      </View>

      <Text style={styles.headerHint}>
        Preencha os dados e envie os documentos solicitados abaixo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  headerPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E6F4F1",
    marginBottom: 14,
  },
  headerPillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: "#0F766E",
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: Colors.white,
  },
  headerIconRing: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#11181C",
    textAlign: "center",
    marginBottom: 14,
  },
  headerLabel: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "700",
    color: "#11181C",
    marginBottom: 8,
  },
  headerBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#0F766E",
    borderRadius: 12,
    padding: 14,
  },
  headerBoxText: {
    fontSize: 14,
    color: "#11181C",
    lineHeight: 20,
  },
  headerBoxTextBold: {
    fontWeight: "800",
    color: "#11181C",
  },
  headerHint: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
