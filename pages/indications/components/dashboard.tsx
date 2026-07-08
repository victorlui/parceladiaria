import ButtonComponent from "@/components/ui/Button";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import { useConfirmPixStore } from "@/store/confirm-pix";
import { formatCurrencyBRL } from "@/utils/formats";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Indications } from "../types/indications";
import ComoFuncionaCard from "./como-funciona-card";
import ListaIndicacoes from "./lista-indicacoes";
import ModalTermos from "./modal-termos";
import Vagas from "./vagas";

interface Props {
  indications: Indications;
  termos: string | null;
  loadingTermo: boolean;
  loadingAccept: boolean;
  getTermos: () => Promise<unknown>;
  acceptTermos: () => Promise<unknown>;
}

export default function Dashboard({
  indications,
  termos,
  loadingTermo,
  loadingAccept,
  getTermos,
  acceptTermos,
}: Props) {
  const { width } = useWindowDimensions();
  const { setData } = useConfirmPixStore();
  const { AlertDisplay } = useAlerts();
  const styles = getStyles(width);
  const [termsModalVisible, setTermsModalVisible] = React.useState(false);
  const [showAcceptButton, setShowAcceptButton] = React.useState(false);

  const availableBalance = indications?.saldo ?? 0;
  const minimumWithdrawal = indications?.valor_minimo_saque ?? 0;
  const termosAceitos =
    indications?.v3?.termos_aceitos ?? indications?.termos_aceitos ?? false;
  const shouldShowTermsAcceptanceOnly =
    Boolean(indications?.v3?.programa_ativo) &&
    !termosAceitos &&
    indications?.v3?.pode_indicar === false;

  const shouldDisableWithdrawButton =
    availableBalance <= 0 || availableBalance < minimumWithdrawal;

  const handleOpenTermsModal = async (withAcceptButton = false) => {
    setShowAcceptButton(withAcceptButton);
    setTermsModalVisible(true);
    await getTermos();
  };

  const handleAcceptTerms = async () => {
    const response = await acceptTermos();

    if (response === undefined) {
      setTermsModalVisible(false);
      setShowAcceptButton(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AlertDisplay />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name="arrow-left"
            size={width < 360 ? 16 : 18}
            color="#233047"
          />
          <Text style={styles.titleIndications}>Programa de Indicações</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={styles.infoCardTopRow}>
            <View>
              <View style={styles.infoHeader}>
                <Ionicons
                  name="wallet"
                  size={width < 360 ? 18 : 20}
                  color={Colors.black}
                />
                <Text style={styles.textinfo}>Saldo disponível</Text>
              </View>
              <Text style={styles.currency}>
                R$ {formatCurrencyBRL(indications.saldo)}
              </Text>
            </View>
            <View>
              <Pressable
                onPress={() => {
                  setData({
                    isLoan: false,
                    value: String(availableBalance),
                  });
                  router.push("/(app)/confirm-pix");
                }}
                style={[
                  styles.button,
                  shouldDisableWithdrawButton && styles.buttonDisabled,
                ]}
                disabled={shouldDisableWithdrawButton}
              >
                <Text style={styles.buttonText}>Solicitar Saque</Text>
              </Pressable>
            </View>
          </View>

          {!indications.v3?.pode_indicar && (
            <Text style={styles.infoMessage}>
              Seu saldo continua disponível para saque mesmo antes de aceitar os
              novos termos.
            </Text>
          )}
        </View>

        {shouldShowTermsAcceptanceOnly ? (
          <View style={styles.infoCardColumn}>
            <View style={styles.codeHeader}>
              <Text style={styles.textinfo}>Aceite os termos do programa</Text>
              <Text style={styles.codeLink}>
                Para liberar sua participação no Programa de Indicações, revise
                e aceite os termos.
              </Text>
            </View>

            <ButtonComponent
              title="Ler e aceitar termos"
              onPress={() => {
                void handleOpenTermsModal(true);
              }}
              iconLeft="document-text"
              iconRight={null}
            />
          </View>
        ) : null}

        {!shouldShowTermsAcceptanceOnly && indications?.v3?.programa_ativo && (
          <Vagas indicationsV3={indications.v3 || null} />
        )}

        {!shouldShowTermsAcceptanceOnly && (
          <ComoFuncionaCard
            hasV3={Boolean(indications?.v3)}
            showRelerTermosButton={true}
            onPressRelerTermos={() => {
              void handleOpenTermsModal();
            }}
          />
        )}

        {!shouldShowTermsAcceptanceOnly && indications?.v3?.pode_indicar && (
          <View style={styles.infoCardColumn}>
            <View style={styles.codeHeader}>
              <Text style={styles.textinfo}>
                Seu código de indicação é{" "}
                <Text style={styles.codeValue}>{indications?.codigo}</Text>
              </Text>
              <Text style={styles.codeLink}>{indications?.link}</Text>
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.actionItem}>
                <ButtonComponent
                  title="Copiar link"
                  onPress={() => {
                    Clipboard.setStringAsync(indications?.link || "");
                  }}
                  iconLeft="copy"
                  iconRight={null}
                />
              </View>

              <View style={styles.actionItem}>
                <ButtonComponent
                  title="Compartilhar"
                  onPress={() => {
                    Share.share({
                      message: indications?.link || "",
                    });
                  }}
                  iconLeft="share-social"
                  iconRight={null}
                  outline
                />
              </View>
            </View>
          </View>
        )}

        {!shouldShowTermsAcceptanceOnly && (
          <ListaIndicacoes indications={indications?.indicacoes || []} />
        )}
      </ScrollView>

      <ModalTermos
        visible={termsModalVisible}
        onClose={() => {
          setTermsModalVisible(false);
          setShowAcceptButton(false);
        }}
        termos={termos}
        loading={loadingTermo}
        showAcceptButton={showAcceptButton}
        loadingAccept={loadingAccept}
        onAccept={() => {
          void handleAcceptTerms();
        }}
        subtitle={showAcceptButton}
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
      paddingHorizontal: 16,
      backgroundColor: Colors.white,
    },
    content: {
      gap: isSmallDevice ? 16 : 20,
      paddingTop: isSmallDevice ? 16 : 20,
      paddingBottom: 24,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 40,
    },
    titleIndications: {
      fontSize: isSmallDevice ? 17 : isMediumDevice ? 18 : 20,
      lineHeight: isSmallDevice ? 24 : isMediumDevice ? 27 : 30,
      fontWeight: "700",
      color: "#233047",
    },
    infoCard: {
      gap: 12,
      paddingVertical: isSmallDevice ? 18 : isMediumDevice ? 22 : 24,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
      borderRadius: isSmallDevice ? 22 : 26,
      borderWidth: 1,
      borderColor: "#D7E1DF",
      backgroundColor: "#F1FAF8",
      shadowColor: "#053D39",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    infoCardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    infoCardColumn: {
      paddingVertical: isSmallDevice ? 18 : isMediumDevice ? 22 : 24,
      paddingHorizontal: isSmallDevice ? 18 : isMediumDevice ? 22 : 26,
      borderRadius: isSmallDevice ? 22 : 26,
      borderWidth: 1,
      borderColor: "#D7E1DF",
      backgroundColor: "#F1FAF8",
      shadowColor: "#053D39",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
      gap: isSmallDevice ? 16 : 18,
    },
    infoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    textinfo: {
      fontSize: isSmallDevice ? 15 : isMediumDevice ? 16 : 18,
      lineHeight: isSmallDevice ? 22 : isMediumDevice ? 25 : 28,
      fontWeight: "700",
      color: "#0F172A",
    },
    currency: {
      marginTop: 8,
      fontSize: isSmallDevice ? 20 : isMediumDevice ? 22 : 26,
      lineHeight: isSmallDevice ? 28 : isMediumDevice ? 31 : 34,
      fontWeight: "700",
      color: Colors.green.text,
    },
    button: {
      minHeight: isSmallDevice ? 44 : 48,
      backgroundColor: Colors.green.text,
      paddingVertical: 12,
      paddingHorizontal: isSmallDevice ? 16 : 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: {
      backgroundColor: Colors.gray.primary,
    },
    buttonText: {
      fontSize: isSmallDevice ? 12 : 13,
      lineHeight: isSmallDevice ? 18 : 20,
      fontWeight: "700",
      color: Colors.white,
    },
    infoMessage: {
      fontSize: isSmallDevice ? 12 : 13,
      lineHeight: isSmallDevice ? 18 : 20,
      color: "#475569",
    },
    codeHeader: {
      gap: 6,
    },
    codeValue: {
      fontWeight: "900",
      color: "#0F172A",
    },
    codeLink: {
      fontSize: isSmallDevice ? 12 : 13,
      lineHeight: isSmallDevice ? 18 : 20,
      color: "#475569",
    },
    actionsRow: {
      flexDirection: "row",
      width: "100%",
      gap: 10,
    },
    actionItem: {
      flex: 1,
    },
  });
};
