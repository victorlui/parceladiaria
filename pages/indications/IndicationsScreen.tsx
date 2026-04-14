import React, { useState } from "react";
import ButtonComponent from "@/components/ui/Button";
import LoadingScreen from "@/components/ui/LoadingScreen";
import RenderTermos from "./components/render-termos";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useIndicationHook } from "./hooks/useIndicationHook";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { TermosFooter } from "./components/termos-footer";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import ModalConfirm from "./components/modal-confirm";
import { formatCurrencyBRL } from "@/utils/formats";

const TermosBody = React.memo(({ termos }: { termos: string }) => {
  return (
    <>
      <Text style={styles.title}>Termos e Condições de uso</Text>

      <View style={styles.webviewContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <RenderTermos termos={termos} />
        </ScrollView>
      </View>
    </>
  );
});

const IndicationsScreen: React.FC = () => {
  const { indications, termos, loadingTermo, changePixKey, updateSaqueAtual } =
    useIndicationHook();
  const [visible, setVisible] = useState(false);

  const saldo = indications?.data?.saldo ?? 0;
  const minimo = indications?.data?.valor_minimo_saque ?? 0;
  const saqueAtual = indications?.data?.saque_atual;
  const saqueStatus =
    typeof saqueAtual === "string" ? saqueAtual : saqueAtual?.status;
  const saqueValor =
    typeof saqueAtual === "string"
      ? 0
      : typeof saqueAtual?.valor === "string"
        ? Number(saqueAtual.valor.replace(",", "."))
        : typeof saqueAtual?.valor === "number"
          ? saqueAtual.valor
          : 0;
  const saldoDisponivel = Math.max(
    0,
    saldo - (Number.isFinite(saqueValor) ? saqueValor : 0),
  );

  let buttonText = "Solicitar saque";
  let isDisabled = false;

  if (saqueStatus) {
    isDisabled = true;
    buttonText = saqueStatus.charAt(0).toUpperCase() + saqueStatus.slice(1);
  } else if (saldo === 0) {
    isDisabled = true;
    buttonText = "Saldo indisponível";
  } else if (saldo < minimo) {
    isDisabled = true;
    buttonText = `Mínimo: R$ ${formatCurrencyBRL(minimo)}`;
  }

  if (loadingTermo) {
    return <LoadingScreen />;
  }

  if (termos && !loadingTermo) {
    return (
      <SafeAreaView style={styles.container}>
        <TermosBody termos={termos} />
        <TermosFooter />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.containerinfo}>
          <View>
            <View style={styles.headerinfo}>
              <Ionicons name="wallet" size={20} color={Colors.black} />
              <Text style={styles.textinfo}>Saldo disponível</Text>
            </View>
            <Text style={styles.currency}>
              R$ {formatCurrencyBRL(saldoDisponivel)}
            </Text>
          </View>
          <View>
            <Pressable
              onPress={() => {
                if (!isDisabled) setVisible(true);
              }}
              style={[
                styles.button,
                isDisabled && { backgroundColor: Colors.gray.primary },
              ]}
              disabled={isDisabled}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.containerinfo,
            { flexDirection: "column", alignItems: "flex-start" },
          ]}
        >
          <View style={styles.headerinfo}>
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors.black}
            />
            <Text style={styles.textinfo}>Como funciona</Text>
          </View>

          <View>
            <View style={styles.howItWorksItem}>
              <Ionicons
                name="share-social-outline"
                size={18}
                color={Colors.green.text}
                style={styles.howItWorksIcon}
              />
              <Text style={styles.howItWorksText}>
                Compartilhe seu link com amigos
              </Text>
            </View>

            <View style={styles.howItWorksItem}>
              <Ionicons
                name="person-add-outline"
                size={18}
                color={Colors.green.text}
                style={styles.howItWorksIcon}
              />
              <Text style={styles.howItWorksText}>
                O amigo se cadastra pelo seu link
              </Text>
            </View>

            <View style={styles.howItWorksItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={Colors.green.text}
                style={styles.howItWorksIcon}
              />
              <Text style={styles.howItWorksText}>
                Se aprovado, assim que quitar o contrato
              </Text>
            </View>

            <View style={styles.howItWorksItem}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={Colors.green.text}
                style={styles.howItWorksIcon}
              />
              <Text style={styles.howItWorksText}>
                Você recebe <Text style={{ fontWeight: "bold" }}>R$ 50,00</Text>{" "}
                e saca quando quiser
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.containerinfo,
            { flexDirection: "column", alignItems: "flex-start", gap: 16 },
          ]}
        >
          <View style={{ gap: 4 }}>
            <Text style={styles.textinfo}>
              Seu código de indicação é{" "}
              <Text style={{ fontWeight: "900", color: "#0F172A" }}>
                {indications?.data?.codigo}
              </Text>
            </Text>
            <Text style={{ fontSize: 13, color: "#475569" }}>
              {indications?.data?.link}
            </Text>
          </View>
          <View style={{ gap: 8, flexDirection: "row", width: "100%" }}>
            <View style={{ flex: 1 }}>
              <ButtonComponent
                title="Copiar link"
                onPress={() => {
                  Clipboard.setStringAsync(indications?.data?.link || "");
                }}
                iconLeft="copy"
                iconRight={null}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ButtonComponent
                title="Compartilhar"
                onPress={() => {
                  Share.share({
                    message: indications?.data?.link || "",
                  });
                }}
                iconLeft="share-social"
                iconRight={null}
                outline
              />
            </View>
          </View>
        </View>

        {/* SUAS INDICAÇÕES CARD */}
        <View
          style={[
            styles.containerinfo,
            { flexDirection: "column", alignItems: "flex-start", gap: 16 },
          ]}
        >
          <Text style={styles.textinfo}>Suas Indicações</Text>

          {!indications?.data?.indicacoes ||
          indications?.data?.indicacoes.length === 0 ? (
            <Text style={{ fontSize: 13, color: "#475569" }}>
              Nenhuma indicação ainda. Compartilhe seu link!
            </Text>
          ) : (
            indications?.data?.indicacoes.map((item) => (
              <View key={item.id} style={styles.indicationCard}>
                <View style={styles.indicationHeader}>
                  <Text style={styles.indicationName}>
                    {item.nome
                      .split(" ")
                      .map((part, idx, arr) =>
                        idx === 0
                          ? part
                          : idx === arr.length - 1
                            ? part.slice(0, 3) + "***"
                            : "",
                      )
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "concluido"
                        ? styles.statusConcluido
                        : styles.statusAprovado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === "concluido"
                          ? styles.statusTextConcluido
                          : styles.statusTextAprovado,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                {item.status === "concluido" && item.recompensa !== null && (
                  <Text style={styles.indicationDetail}>
                    Recompensa:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      R$ {formatCurrencyBRL(item.recompensa)}
                    </Text>
                  </Text>
                )}
                {item.parcelas && (
                  <Text style={styles.indicationDetail}>
                    Parcelas: {item.parcelas.pagas} / {item.parcelas.total}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <ModalConfirm
        visible={visible}
        onClose={() => setVisible(false)}
        indications={indications}
        onChangePixKey={changePixKey}
        onSuccess={updateSaqueAtual}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  containerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  webviewContainer: {
    flex: 1,
    height: 300,
  },
  // Dashboard
  containerinfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#F1FAF8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  headerinfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textinfo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  currency: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.green.text,
  },
  button: {
    backgroundColor: Colors.green.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  howItWorksList: {
    marginTop: 12,
    gap: 10,
  },
  howItWorksItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 8,
    width: "100%",
  },
  howItWorksIcon: {
    marginTop: 1,
  },
  howItWorksText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "400",
    color: "#0F172A",
  },
  indicationCard: {
    width: "100%",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  indicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicationName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F172A",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusAprovado: {
    backgroundColor: "#FEF9C3", // Yellow light
  },
  statusConcluido: {
    backgroundColor: "#DCFCE7", // Green light
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  statusTextAprovado: {
    color: "#854D0E", // Yellow dark
  },
  statusTextConcluido: {
    color: "#166534", // Green dark
  },
  indicationDetail: {
    fontSize: 13,
    color: "#475569",
  },
});

export default IndicationsScreen;
