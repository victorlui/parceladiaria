import ButtonComponent from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Indications } from "../types/indications";
import ModalTermos from "./modal-termos";

type Props = {
  loadingApply?: boolean;
  applyCode?: (code: string) => Promise<void>;
  indications?: Indications;
  termos?: string | null;
  loadingTermo?: boolean;
  loadingAccept?: boolean;
  getTermos?: () => Promise<unknown>;
  acceptTermos?: () => Promise<unknown>;
};

export default function NaoAfiliado({
  loadingApply = false,
  applyCode,
  indications,
  termos = null,
  loadingTermo = false,
  loadingAccept = false,
  getTermos,
  acceptTermos,
}: Props) {
  const { width } = useWindowDimensions();
  const styles = getStyles(width);
  const [affiliateCode, setAffiliateCode] = React.useState("");
  const [showAffiliateCard, setShowAffiliateCard] = React.useState(false);
  const [termsModalVisible, setTermsModalVisible] = React.useState(false);

  const hasCode = Boolean(affiliateCode.trim());
  const hasAvailableCode = Boolean(indications?.codigo_disponivel);
  const isAlreadyIndicated = Boolean(indications?.foi_indicado);

  const handleApplyCode = async () => {
    if (!hasCode || !applyCode || loadingApply) {
      return;
    }

    await applyCode(affiliateCode.trim().toUpperCase());
  };

  const handleOpenTermsModal = async () => {
    setTermsModalVisible(true);
    await getTermos?.();
  };

  const handleAcceptTerms = async () => {
    const response = await acceptTermos?.();

    if (response === undefined) {
      setTermsModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color="#233047" />
          </Pressable>

          <View style={styles.headerTitleWrapper}>
            <FontAwesome5
              name="gift"
              size={width < 360 ? 18 : 20}
              color="#F59E0B"
            />
            <Text style={styles.headerTitle}>Benefícios</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {hasAvailableCode && !isAlreadyIndicated && (
          <View style={styles.applyCard}>
            <View style={styles.titleRow}>
              <Ionicons
                name="people"
                size={width < 360 ? 18 : 20}
                color="#0F172A"
              />
              <Text style={styles.cardTitle}>Código de indicação</Text>
            </View>

            <Text style={styles.cardDescription}>
              Foi indicado por alguém? Digite seu código para liberar
              benefícios.
            </Text>

            <TextInput
              value={affiliateCode}
              onChangeText={setAffiliateCode}
              placeholder="DIGITE O CÓDIGO"
              placeholderTextColor="#8A8F98"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loadingApply}
              returnKeyType="send"
              onSubmitEditing={() => {
                void handleApplyCode();
              }}
              style={styles.input}
            />

            <View style={styles.applyButtonWrapper}>
              <ButtonComponent
                title="Aplicar Código"
                onPress={() => {
                  void handleApplyCode();
                }}
                loading={loadingApply}
                disabled={!hasCode || !applyCode}
                iconLeft="check"
                iconRight={null}
              />
            </View>
          </View>
        )}

        {isAlreadyIndicated && (
          <View style={styles.linkedCodeCard}>
            <View style={styles.titleRow}>
              <Ionicons
                name="checkmark-circle"
                size={width < 360 ? 18 : 20}
                color="#15803D"
              />
              <Text style={styles.linkedCodeTitle}>Código já vinculado</Text>
            </View>

            <Text style={styles.linkedCodeDescription}>
              Você já possui um código de indicação vinculado à sua conta.
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => setShowAffiliateCard((prev) => !prev)}
          style={styles.affiliateTriggerCard}
        >
          <View style={styles.affiliateTriggerCardContent}>
            <View style={styles.affiliateTriggerTextWrapper}>
              <Text style={styles.affiliateTriggerTitle}>Seja um afiliado</Text>
              <Text style={styles.affiliateTriggerDescription}>
                Indique amigos e ganhe R$ 50,00 por cada um aprovado. Toque para
                ver como participar.
              </Text>
            </View>

            <Ionicons
              name={showAffiliateCard ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.primaryColor}
            />
          </View>
        </Pressable>

        {showAffiliateCard ? (
          <View style={styles.affiliateInfoCard}>
            <Text style={styles.affiliateInfoText}>
              Para participar do Programa de Indicação do Parcela Diária,{" "}
              <Text style={styles.highlightText}>
                pague a primeira parcela do seu contrato
              </Text>{" "}
              e aceite os termos do programa.
            </Text>

            <Text style={styles.affiliateInfoText}>
              Depois é só compartilhar seu link, e a cada{" "}
              <Text style={styles.highlightText}>amigo aprovado</Text> você
              ganha <Text style={styles.highlightText}>R$ 50,00</Text>, sacável
              via PIX.
            </Text>

            {indications?.v3?.requisitos?.parcela1_paga && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.termsButton}
                onPress={() => {
                  void handleOpenTermsModal();
                }}
              >
                <Text style={styles.termsButtonText}>
                  Ler os termos do programa
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </ScrollView>

      <ModalTermos
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        termos={termos}
        loading={loadingTermo}
        showAcceptButton
        loadingAccept={loadingAccept}
        onAccept={() => {
          void handleAcceptTerms();
        }}
        subtitle
      />
    </SafeAreaView>
  );
}

const getStyles = (width: number) => {
  const isSmallDevice = width < 360;
  const isMediumDevice = width >= 360 && width < 430;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: isSmallDevice ? 18 : 22,
      paddingBottom: 28,
      gap: isSmallDevice ? 14 : 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitleWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      flex: 1,
    },
    headerTitle: {
      color: "#233047",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
    },
    headerSpacer: {
      width: 40,
    },
    applyCard: {
      backgroundColor: "#F1FAF8",
      borderRadius: isSmallDevice ? 22 : 26,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
      paddingVertical: isSmallDevice ? 20 : isMediumDevice ? 24 : 28,
      borderWidth: 1,
      borderColor: "#D7E1DF",
      gap: isSmallDevice ? 16 : 18,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cardTitle: {
      color: "#233047",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
    },
    cardDescription: {
      color: "#6B7280",
      fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
      lineHeight: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
    },
    input: {
      minHeight: isSmallDevice ? 52 : 56,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#D7E1DF",
      backgroundColor: "#FFFFFF",
      textAlign: "center",
      color: "#233047",
      fontSize: isSmallDevice ? 16 : isMediumDevice ? 17 : 18,
      letterSpacing: 2.5,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontWeight: "500",
    },
    applyButtonWrapper: {
      borderRadius: 16,
      overflow: "hidden",
    },
    linkedCodeCard: {
      backgroundColor: "#ECFDF3",
      borderRadius: isSmallDevice ? 22 : 26,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
      paddingVertical: isSmallDevice ? 18 : isMediumDevice ? 22 : 24,
      borderWidth: 1,
      borderColor: "#BBF7D0",
      gap: 10,
    },
    linkedCodeTitle: {
      color: "#166534",
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
    },
    linkedCodeDescription: {
      color: "#166534",
      fontSize: isSmallDevice ? 14 : isMediumDevice ? 15 : 16,
      lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
      fontWeight: "500",
    },
    affiliateTriggerCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: Colors.borderColor,
      backgroundColor: Colors.white,
      paddingHorizontal: isSmallDevice ? 18 : 20,
      paddingVertical: isSmallDevice ? 14 : 16,
    },
    affiliateTriggerCardPressed: {
      opacity: 0.9,
    },
    affiliateTriggerCardContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    affiliateTriggerTextWrapper: {
      flex: 1,
      gap: 4,
    },
    affiliateTriggerTitle: {
      color: "#1F3B39",
      fontSize: isSmallDevice ? 16 : isMediumDevice ? 17 : 18,
      lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
      fontWeight: "700",
    },
    affiliateTriggerDescription: {
      color: "#6B7280",
      fontSize: isSmallDevice ? 13 : isMediumDevice ? 14 : 15,
      lineHeight: isSmallDevice ? 19 : isMediumDevice ? 21 : 23,
    },
    affiliateInfoCard: {
      backgroundColor: Colors.primaryColor,
      borderRadius: 18,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 20 : 22,
      paddingVertical: isSmallDevice ? 18 : isMediumDevice ? 20 : 22,
      gap: 14,
    },
    affiliateInfoText: {
      color: Colors.white,
      fontSize: isSmallDevice ? 15 : isMediumDevice ? 16 : 17,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 26 : 28,
      fontWeight: "500",
    },
    highlightText: {
      color: "#2BE37A",
      fontWeight: "700",
    },
    termsButton: {
      marginTop: 6,
      minHeight: isSmallDevice ? 50 : 54,
      borderRadius: 16,
      backgroundColor: "#42D15F",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isSmallDevice ? 18 : 22,
      paddingVertical: 12,
    },
    termsButtonText: {
      color: "#063B37",
      fontSize: isSmallDevice ? 16 : isMediumDevice ? 17 : 18,
      lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
      fontWeight: "800",
      textAlign: "center",
    },
  });
};
