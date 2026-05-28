import ButtonComponent from "@/components/ui/Button";
import InputComponent from "@/components/ui/Input";
import { useAlerts } from "@/components/useAlert";
import { Colors } from "@/constants/Colors";
import api from "@/services/api";
import { useConfirmPixStore } from "@/store/confirm-pix";
import { formatCurrencyBRL } from "@/utils/formats";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PulsingImageLoader from "../register/components/PulsingImageLoader";
import ModalConfirm from "./components/modal-confirm";
import RenderTermos from "./components/render-termos";
import { TermosFooter } from "./components/termos-footer";
import { useIndicationHook } from "./hooks/useIndicationHook";

const TermosBody = React.memo(function TermosBody({
  termos,
}: {
  termos: string;
}) {
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
  const {
    hasCode,
    foiIndicado,
    indications,
    termos,
    accepted,
    loadingTermo,
    loadingAccept,
    loadingLoans,
    totalLoans,
    toggleAccepted,
    acceptTermos,
    changePixKey,
    updateSaqueAtual,
    getTermos,
    clearTermos,
  } = useIndicationHook();
  const { AlertDisplay, showSuccess, showWarning } = useAlerts();
  const { setData } = useConfirmPixStore();
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [termosVisible, setTermosVisible] = useState<boolean>(false);

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

  async function onSubmit() {
    if (!code) {
      showWarning("Atenção", "Digite o código de indicação");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/v1/affiliate/apply-code", {
        codigo: code,
      });
      setLoading(false);
      showSuccess("Sucesso", "Código aplicado com sucesso");
    } catch (error: any) {
      setLoading(false);
      showWarning(
        "Atenção",
        error.response?.data?.message ?? "Erro ao aplicar código",
      );
    }
  }

  if (loadingTermo || loadingLoans) {
    return (
      <PulsingImageLoader
        source={require("@/assets/images/logo-verde.png")}
        text={
          loadingTermo
            ? "Caregando termos"
            : loadingLoans
              ? "Caregando dados"
              : ""
        }
      />
    );
  }

  const ButtonBack = () => {
    return (
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginVertical: 10,
        }}
      >
        <FontAwesome5 name="arrow-left" size={18} color="black" />
        <Text style={styles.titleIndications}>Indicações</Text>
      </TouchableOpacity>
    );
  };

  if (indications === null && !foiIndicado && !hasCode && totalLoans > 1) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ButtonBack />
          <View style={styles.emptyState}>
            <View style={styles.emptyHero}>
              <View style={styles.emptyLogo}>
                <Image
                  source={require("@/assets/images/icon_new.png")}
                  style={styles.emptyLogoImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.emptyHeader}>
                <Ionicons name="gift" size={22} color={Colors.green.text} />
                <Text style={styles.emptyHeaderText}>Benefícios</Text>
              </View>
              <Text style={styles.emptySubtitle}>
                No momento, não há benefícios disponíveis para você.
              </Text>
            </View>

            <View style={styles.emptyCard}>
              <View style={styles.emptyCardIcon}>
                <Ionicons
                  name="information-circle"
                  size={22}
                  color={Colors.green.text}
                />
              </View>
              <View style={styles.emptyCardBody}>
                <Text style={styles.emptyCardTitle}>Sem benefícios agora</Text>
                <Text style={styles.emptyCardText}>
                  Volte mais tarde para conferir novidades.
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (indications === null && !foiIndicado && (hasCode || totalLoans <= 1)) {
    return (
      <SafeAreaView style={styles.container}>
        <ButtonBack />
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.applyCodeContent}
          >
            <AlertDisplay />
            <View style={styles.emptyHero}>
              <View style={styles.emptyLogo}>
                <Image
                  source={require("@/assets/images/icon_new.png")}
                  style={styles.emptyLogoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View
              style={[
                styles.applyCodeHeader,
                {
                  gap: 3,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                },
              ]}
            >
              <Ionicons name="gift" size={22} color={Colors.green.text} />
              <Text style={[styles.applyCodeHeaderText, { marginLeft: 5 }]}>
                Benefícios
              </Text>
            </View>

            <View style={styles.applyCodeCard}>
              <View
                style={[
                  styles.applyCodeCardTitleRow,
                  {
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                  },
                ]}
              >
                <Text style={[styles.applyCodeCardTitle]}>
                  <Ionicons
                    name="people"
                    size={20}
                    color={Colors.black}
                    style={{ marginRight: 8 }}
                  />{" "}
                  Código de indicação
                </Text>
                <Text
                  style={[
                    styles.applyCodeSubtitle,
                    { textAlign: "left", paddingHorizontal: 0 },
                  ]}
                >
                  Foi indicado por alguém? Digite seu código para liberar
                  benefícios.
                </Text>
              </View>

              <InputComponent
                placeholder="DIGITE O CÓDIGO"
                value={code}
                onChangeText={setCode}
                returnKeyType="send"
                onSubmitEditing={() => onSubmit()}
                editable={!loading}
                autoCapitalize="characters"
              />

              <ButtonComponent
                loading={loading}
                iconLeft={"check"}
                iconRight={null}
                title="Aplicar Código"
                onPress={() => onSubmit()}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (foiIndicado && indications === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ButtonBack />
        <View style={styles.emptyState}>
          <View style={[styles.emptyHero]}>
            <View style={[styles.emptyLogo]}>
              <Image
                source={require("@/assets/images/icon_new.png")}
                style={styles.emptyLogoImage}
                resizeMode="contain"
              />
            </View>

            <View
              style={[
                styles.applyCodeHeader,
                {
                  gap: 3,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  width: "100%",
                },
              ]}
            >
              <Ionicons name="gift" size={22} color={Colors.green.text} />
              <Text style={[styles.applyCodeHeaderText, { marginLeft: 5 }]}>
                Benefícios
              </Text>
            </View>
          </View>

          <View style={styles.emptyCard}>
            <View style={styles.emptyCardIcon}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.green.text}
              />
            </View>
            <View style={styles.emptyCardBody}>
              <Text style={styles.emptyCardTitle}>Código aplicado</Text>
              <Text style={styles.emptyCardText}>
                Você já possui um código de indicação vinculado à sua conta.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (termosVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <TermosBody termos={termos || ""} />
        <TermosFooter
          isReading={true}
          accepted={accepted}
          loadingAccept={loadingAccept}
          toggleAccepted={toggleAccepted}
          acceptTermos={() => {
            setTermosVisible(false);
            clearTermos();
          }}
        />
      </SafeAreaView>
    );
  }

  if (indications && termos && !loadingTermo && !termosVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <TermosBody termos={termos} />
        <TermosFooter
          accepted={accepted}
          loadingAccept={loadingAccept}
          toggleAccepted={toggleAccepted}
          acceptTermos={acceptTermos}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ButtonBack />
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
                setData({
                  isLoan: false,
                  value: String(saldoDisponivel),
                });
                router.push("/(app)/confirm-pix");
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
              <Text style={styles.howItWorksText}>Se for aprovado</Text>
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

          <TouchableOpacity
            onPress={() => {
              setTermosVisible(true);
              getTermos();
            }}
            style={{
              borderWidth: 1,
              borderColor: Colors.borderColor,
              padding: 12,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Ionicons name="document" size={20} color={Colors.black} />
            <Text style={{ color: Colors.black, fontWeight: "bold" }}>
              Reler termos do programa
            </Text>
          </TouchableOpacity>
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
  titleIndications: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
    paddingVertical: 12,
  },
  emptyHero: {
    alignSelf: "stretch",
    alignItems: "center",
    gap: 12,
  },
  emptyLogo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#F1FAF8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  emptyLogoImage: {
    width: 72,
    height: 72,
  },
  emptyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyHeaderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#475569",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyCard: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
  emptyCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCardBody: {
    flex: 1,
    gap: 2,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyCardText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#475569",
    lineHeight: 18,
  },
  keyboardAvoid: {
    flex: 1,
  },
  applyCodeContent: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 12,
    paddingVertical: 12,
  },
  applyCodeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 6,
  },
  applyCodeHeaderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  applyCodeSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#475569",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  applyCodeCard: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#F1FAF8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    gap: 12,
  },
  applyCodeCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  applyCodeCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
});

export default IndicationsScreen;
