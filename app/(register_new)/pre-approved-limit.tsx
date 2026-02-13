/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { Colors } from "@/constants/Colors";
import { formatCurrency } from "@/utils/formats";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import RingLoader from "@/components/ui/RingLoader";
import LayoutRegister from "@/layouts/layout-register";
import ButtonComponent from "@/components/ui/Button";
import ModalTerms from "@/components/config/modal-terms";
import { router } from "expo-router";

const PreApprovedLimit: React.FC = () => {
  const [step, setStep] = React.useState<"search" | "found" | "limit">(
    "search",
  );
  const [limit] = React.useState<number>(600);
  const [accepted, setAccepted] = React.useState<boolean>(false);
  const [termsVisible, setTermsVisible] = React.useState<boolean>(false);
  const [termsHtml, setTermsHtml] = React.useState<string>("");

  React.useEffect(() => {
    const t1 = setTimeout(() => setStep("found"), 2000);
    const t2 = setTimeout(() => setStep("limit"), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  React.useEffect(() => {}, [step]);

  const openTerms = React.useCallback(async () => {
    try {
      const asset = Asset.fromModule(
        require("@/assets/termodeuso_cadastro.html"),
      );
      await asset.downloadAsync();
      const fileUri = asset.localUri || asset.uri;
      if (!fileUri) throw new Error("URI inválida para Termos de Uso.");

      const response = await fetch(fileUri);
      const html = await response.text();

      const css = `
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; font-size:16px; line-height:1.5; padding:16px; margin:0; color:#333; background:#fff; }
              h1,h2,h3 { font-weight:600; color:#111; margin:20px 0 10px; }
              p,li { font-size:16px; margin-bottom:10px; text-align:justify; }
              ul,ol { padding-left:20px; }
              strong { font-weight:600; color:#111; }
            </style>
          `;
      setTermsHtml(`<html><head>${css}</head><body>${html}</body></html>`);
      setTermsVisible(true);
    } catch (err) {
      setTermsHtml(
        "<html><body><p>Erro ao carregar os termos de uso.</p></body></html>",
      );
      setTermsVisible(true);
    }
  }, []);

  const onSubmit = () => {
    console.log("accepted", accepted);
    router.push("/(register_new)/register-phone");
  };

  return (
    <LayoutRegister>
      <View style={styles.container}>
        {step === "search" && (
          <View style={styles.loadingBox}>
            <RingLoader animate />
            <Text style={styles.loadingText}>
              Consultando ofertas disponíveis para você...
            </Text>
          </View>
        )}

        {step === "found" && (
          <View style={styles.loadingBox}>
            <RingLoader />
            <Text style={styles.loadingText}>Oferta encontrada!</Text>
          </View>
        )}

        {step === "limit" && (
          <>
            <View style={styles.limitContainer}>
              <Text style={styles.limitTitle}>Limite pré-aprovado</Text>
              <View style={styles.limitCard}>
                <Text style={styles.limitValue}>{formatCurrency(limit)}</Text>
                <Text style={styles.limitParcel}>
                  em 26 parcelas de R$ 30,30 por dia
                </Text>
                <Text style={styles.limitSubtitle}>
                  Sujeito à aprovação após análise de crédito
                </Text>
                <Text style={styles.limitSubtitle}>
                  O valor do empréstimo está sujeito a descontos de impostos e
                  taxas.
                </Text>
              </View>
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={[styles.checkbox, accepted && styles.checkboxChecked]}
                onPress={() => setAccepted((prev) => !prev)}
                activeOpacity={0.8}
              >
                {accepted && (
                  <FontAwesome name="check" size={14} color={Colors.white} />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                Li e aceito os
                <Text style={styles.termsLink} onPress={openTerms}>
                  {" "}
                  Termos e Condições
                </Text>{" "}
                e a proposta.
              </Text>
            </View>

            <ButtonComponent
              title="Continuar"
              onPress={onSubmit}
              disabled={!accepted}
              iconLeft={null}
            />

            <ModalTerms
              visible={termsVisible}
              onClose={() => {
                setAccepted(true);
                setTermsVisible(false);
              }}
              title="Termos e Condições"
              htmlContent={termsHtml}
            />
          </>
        )}
      </View>
    </LayoutRegister>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",

    gap: 16,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.green.text,
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  foundBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.green.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  foundText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.green.primary,
    borderColor: Colors.green.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
  },
  termsLink: {
    color: Colors.green.text,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  limitCard: {
    borderWidth: 1,
    borderColor: Colors.green.primary,
    backgroundColor: "#EDF8F8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },

  limitContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  limitTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.black,
  },
  limitValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.green.text,
  },
  limitParcel: {
    fontWeight: "bold",
    color: Colors.green.text,
  },
  limitSubtitle: {
    fontSize: 12,
    color: Colors.gray.text,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PreApprovedLimit;
