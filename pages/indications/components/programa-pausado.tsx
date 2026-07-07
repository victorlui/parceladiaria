import { Colors } from "@/constants/Colors";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgramaPausado() {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.statusCard}>
          <View style={styles.statusIconWrapper}>
            <MaterialIcons
              name="pause-circle-filled"
              size={width < 360 ? 54 : 62}
              color="#D97706"
            />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Programa pausado</Text>
          </View>

          <Text style={styles.heroTitle}>
            O programa de indicação está temporariamente indisponível.
          </Text>

          <Text style={styles.heroText}>
            No momento, novas indicações e liberações de vagas estão pausadas.
          </Text>

          <Text style={styles.heroText}>
            Assim que o programa for retomado, você poderá voltar a indicar e
            acompanhar as suas oportunidades normalmente.
          </Text>
        </View>

        {/* <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle"
              size={width < 360 ? 22 : width < 430 ? 24 : 28}
              color={Colors.primaryColor}
            />
            <Text style={styles.sectionTitle}>O que isso significa</Text>
          </View>

          <View style={styles.list}>
            <View style={styles.listItem}>
              <Ionicons
                name="pause-circle-outline"
                size={width < 360 ? 18 : 20}
                color="#D97706"
              />
              <Text style={styles.listText}>
                Novas indicações não podem ser realizadas durante esta pausa.
              </Text>
            </View>

            <View style={styles.listItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={width < 360 ? 18 : 20}
                color={Colors.green.button}
              />
              <Text style={styles.listText}>
                Seus dados e histórico permanecem preservados no aplicativo.
              </Text>
            </View>

            <View style={styles.listItem}>
              <Ionicons
                name="notifications-outline"
                size={width < 360 ? 18 : 20}
                color={Colors.primaryColor}
              />
              <Text style={styles.listText}>
                Quando o programa retornar, você poderá continuar de onde parou.
              </Text>
            </View>
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  const titleSize = isSmallDevice ? 17 : isMediumDevice ? 18 : 21;
  const bodySize = isSmallDevice ? 14 : isMediumDevice ? 15 : 17;
  const sectionTitleSize = isSmallDevice ? 18 : isMediumDevice ? 19 : 21;
  const titleLineHeight = isSmallDevice ? 26 : isMediumDevice ? 28 : 32;
  const bodyLineHeight = isSmallDevice ? 22 : isMediumDevice ? 24 : 28;
  const cardPaddingHorizontal = isSmallDevice ? 18 : isMediumDevice ? 20 : 24;
  const cardPaddingVertical = isSmallDevice ? 20 : isMediumDevice ? 24 : 28;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
      paddingHorizontal: 16,
    },
    content: {
      paddingTop: isSmallDevice ? 18 : 24,
      paddingBottom: 24,
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
    statusCard: {
      backgroundColor: "#FFF7ED",
      borderRadius: isSmallDevice ? 22 : 26,
      paddingHorizontal: cardPaddingHorizontal,
      paddingVertical: cardPaddingVertical,
      borderWidth: 1,
      borderColor: "#FCD9BD",
      shadowColor: "#7C2D12",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
      alignItems: "center",
    },
    statusIconWrapper: {
      width: isSmallDevice ? 84 : 96,
      height: isSmallDevice ? 84 : 96,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFEDD5",
      marginBottom: isSmallDevice ? 14 : 18,
    },
    badge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: "#FDE68A",
      marginBottom: isSmallDevice ? 14 : 18,
    },
    badgeText: {
      color: "#92400E",
      fontSize: isSmallDevice ? 12 : 13,
      fontWeight: "700",
    },
    heroTitle: {
      color: "#233047",
      fontSize: titleSize,
      fontWeight: "700",
      textAlign: "center",
      lineHeight: titleLineHeight,
    },
    heroText: {
      marginTop: isSmallDevice ? 12 : 16,
      color: "#4B5563",
      fontSize: bodySize,
      textAlign: "center",
      lineHeight: bodyLineHeight,
    },
    infoCard: {
      backgroundColor: "#F3F6F6",
      borderRadius: isSmallDevice ? 22 : 26,
      paddingHorizontal: cardPaddingHorizontal,
      paddingVertical: cardPaddingVertical,
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
    list: {
      gap: isSmallDevice ? 12 : 16,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    listText: {
      flex: 1,
      color: "#2C3748",
      fontSize: bodySize,
      lineHeight: bodyLineHeight,
    },
  });
};
