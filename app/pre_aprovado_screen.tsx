import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Network from "expo-network";
import { useAuthStore } from "@/store/auth";
import { acceptedTerms } from "@/services/terms";
import { useAlerts } from "@/components/useAlert";
import { router } from "expo-router";
import LoadingDots from "@/components/ui/LoadingDots";

const PreAprovado: React.FC = () => {
  const { userRegister, logout } = useAuthStore();
  const { showSuccess, hideAlert, AlertDisplay } = useAlerts();
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openWhatsApp = async () => {
    const phoneNumber = "5511960882293"; // sem +
    const message = "Olá! Vamos realizar a vídeo chamada agora?";

    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("WhatsApp não está instalado.");
    }
  };

  const onContinue = async () => {
    if (!accepted) return;
    setIsLoading(true);
    try {
      const ip = await Network.getIpAddressAsync();
      const termsData = {
        sign_info_date: new Date()
          .toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
          .replace(
            /(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)\s(AM|PM)/,
            (_, month, day, year, hours, minutes, seconds, period) => {
              const h =
                period === "PM" ? parseInt(hours) + 12 : parseInt(hours);
              return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${h.toString().padStart(2, "0")}:${minutes}:${seconds}-03:00`;
            }
          ),
        sign_info_ip_address: ip,
        sign_info_city: userRegister?.cidade ?? "São Paulo",
        sign_info_state: userRegister?.estado ?? "SP",
        sign_info_country: "BR",
      };

      console.log("Dados dos termos:", termsData);

      await acceptedTerms(termsData);
      showSuccess(
        "Sucesso",
        `Agora entraremos em contato para chamada de vídeo para finalizar o processo`,
        () => {
          hideAlert();
          openWhatsApp();
          logout();
          router.replace("/login");
        }
      );
    } catch (error) {
      console.error("Error ao aceitar os termos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onExit = () => {
    logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <AlertDisplay />
      <StatusBar />
      <View style={styles.content}>
        <View style={{ gap: 10 }}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <FontAwesome name="file-text" size={18} color={Colors.white} />
            </View>
            <Text style={styles.title}>Termos e Condições</Text>
          </View>

          <Text style={styles.subtitle}>
            Por favor, leia atentamente os termos de uso abaixo antes de
            continuar.
          </Text>
        </View>

        <View style={styles.termsCard}>
          <ScrollView
            style={styles.termsBox}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <Text style={styles.termsTitle}>DETALHES DO CONTRATO</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Valor do Contrato: <Text style={styles.bold}>R$ 600,00</Text>
              </Text>
              <Text style={styles.listItem}>
                • IOF (0,63%): <Text style={styles.bold}>- R$ 3,78</Text>
              </Text>
              <Text style={styles.listItem}>
                • Taxa T.I.C. (1,68%):{" "}
                <Text style={styles.bold}>- R$ 10,08</Text>
              </Text>
              <Text style={styles.listItem}>
                • Valor a Receber: <Text style={styles.bold}>R$ 586,14</Text>
              </Text>
            </View>

            <Text style={styles.termsTitle}>PAGAMENTOS</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Lembrando, os pagamentos são diários de segunda à sábado
                (incluindo feriados), exceto aos domingos.
              </Text>
              <Text style={styles.listItem}>
                • O pagamento deve ser realizado até as 23hs, horário de
                Brasília.
              </Text>
              <Text style={styles.listItem}>
                • O pagamento das suas parcelas deverá ser realizado apenas pelo
                nosso site na área de clientes.
              </Text>
            </View>

            <Text style={styles.termsTitle}>PENALIDADES POR ATRASO</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Em casos de atrasos no pagamento, ocorrerá uma renegociação
                automática de sua dívida conforme acordado em contrato.
              </Text>
              <Text style={styles.listItem}>
                • Esta penalidade acontece a cada 2 (dois) atrasos.
              </Text>
              <Text style={styles.listItem}>
                • O valor acrescentado será de 5% sobre o valor total
                financiado.
              </Text>
              <Text style={styles.listItem}>
                • O valor da penalidade será lançado em forma de uma parcela
                extra em seu contrato, tendo a data de pagamento para um dia
                após a sua última parcela lançada.
              </Text>
            </View>

            <Text style={styles.termsTitle}>RENOVAÇÕES</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • O aumento de limite é progressivo de R$300,00 em R$300,00 a
                cada renovação, podendo chegar até o valor máximo de R$1.500,00.
              </Text>
              <Text style={styles.listItem}>
                • Para renovar o seu empréstimo você deve atender as condições,
                que estão disponíveis na sua área do cliente, em nosso site.
              </Text>
            </View>
          </ScrollView>
        </View>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setAccepted((prev) => !prev)}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && (
              <FontAwesome name="check" size={14} color={Colors.white} />
            )}
          </View>
          <Text style={styles.checkboxText}>
            Li e aceito os Termos e Condições
          </Text>
        </Pressable>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onContinue}
            disabled={!accepted || isLoading}
            style={[
              styles.primaryButton,
              !accepted && styles.primaryButtonDisabled,
            ]}
          >
            {!isLoading && (
              <View style={styles.primaryButtonContent}>
                <FontAwesome name="check" size={16} color={Colors.white} />
                <Text style={styles.primaryButtonText}>
                  Aceitar e Continuar
                </Text>
              </View>
            )}

            {isLoading && <LoadingDots text="Salvando..." />}
          </TouchableOpacity>

          <TouchableOpacity onPress={onExit} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.green.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.text,
  },
  termsCard: {
    borderColor: Colors.borderColor,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.gray.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    marginVertical: 20,
    overflow: "hidden",
    flex: 1,
  },
  termsBox: {
    padding: 16,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
  },
  list: {
    marginLeft: 12,
    marginBottom: 12,
    gap: 6,
  },
  listItem: {
    fontSize: 14,
    color: Colors.black,
  },
  bold: {
    fontWeight: "bold",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    elevation: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: Colors.gray.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    width: "100%",
    marginVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
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
    fontSize: 14,
    color: Colors.black,
  },
  actions: {
    gap: 12,
    marginTop: 4,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: Colors.green.button,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PreAprovado;
