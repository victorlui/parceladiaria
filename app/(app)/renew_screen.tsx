import DrawerMenu from "@/components/DrawerMenu";
import { Colors } from "@/constants/Colors";
import { PropsListRenew, renewList } from "@/services/renew";
import { useAuthStore } from "@/store/auth";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import WebView from "react-native-webview";
import { TermsCheckbox } from "@/components/TermsCheckbox";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import api from "@/services/api";
import * as Network from "expo-network";
import { getClientInfo } from "@/services/loans";
import { convertData } from "@/utils";

export default function RenewScreen() {
  const [list, setList] = useState<PropsListRenew[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState({
    terms: false,
    dataSharing: false,
    payments: false,
    ccb: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const { user } = useAuthStore();

  const allTermsAccepted = Object.values(termsAccepted).every((value) => value);

  const fetchRenewList = async () => {
    try {
      const response = await renewList();
      console.log("res list renew", response);
      const renewWithSelection = response.map((item) => ({
        ...item,
        selected: false,
      }));
      setList(renewWithSelection);
    } catch (error: any) {
      console.log("error", error.response);
    } finally {
      setLoading(false);
    }
  };

  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    const loadHtml = async () => {
      try {
        const asset = Asset.fromModule(require("@/assets/privacidade.html"));
        await asset.downloadAsync();
        let html = await FileSystem.readAsStringAsync(asset.localUri!);

        // CSS simplificado para evitar conflitos
        const cssStyle = `
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 16px;
              line-height: 1.5;
              padding: 16px;
              margin: 0;
              color: #333;
              background-color: #fff;
            }
            h1, h2, h3, h4, h5, h6 {
              font-weight: 600;
              margin-top: 20px;
              margin-bottom: 10px;
              color: #111;
            }
            h1 { font-size: 22px; }
            h2 { font-size: 20px; }
            h3 { font-size: 18px; }
            p {
              font-size: 16px;
              margin-bottom: 10px;
              text-align: justify;
            }
            ul, ol {
              padding-left: 20px;
              margin-bottom: 10px;
            }
            li {
              font-size: 16px;
              margin-bottom: 6px;
            }
            strong, b {
              font-weight: 600;
              color: #111;
            }
          </style>
        `;

        // Inserir o CSS no HTML de forma mais segura
        if (html.includes("</head>")) {
          html = html.replace("</head>", cssStyle + "</head>");
        } else if (html.includes("<body>")) {
          html = html.replace("<body>", "<head>" + cssStyle + "</head><body>");
        } else {
          html =
            "<html><head>" +
            cssStyle +
            "</head><body>" +
            html +
            "</body></html>";
        }

        setHtmlContent(html);
      } catch (error) {
        setHtmlContent(
          "<html><head><style>body{font-size:16px;padding:16px;}</style></head><body><p>Erro ao carregar os termos de uso. Tente novamente.</p></body></html>"
        );
        return error;
      }
    };

    loadHtml();
  }, []);

  useEffect(() => {
    fetchRenewList();
  }, []);

  const toggleItemSelection = (renewId: number) => {
    setSelectedItems(renewId);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRenewList();
    setRefreshing(false);
  };

  const handleContinue = async () => {
    if (allTermsAccepted) {
      setIsLoading(true);
      try {
        const ip = await Network.getIpAddressAsync();

        const response_client = await getClientInfo();

        const termsData = {
          id: selectedItems,
          sign_info_date: convertData(),
          sign_info_ip_address: ip,
          sign_info_city: response_client?.city ?? "",
          sign_info_state: response_client?.uf ?? "",
          sign_info_country: "BR",
        };

        await api.post("/v1/renew", termsData);
        console.log("sucesso", termsData);
        
       
        
        Alert.alert("Sucesso", `Renovação concluida com sucesso`, [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(app)/home");
            },
          },
        ]);

        setTermsModalVisible(false);
      } catch (error: any) {
        console.log("Erro o realizar a renovação:", error.response);
      } finally {
        setIsLoading(false);
         // Resetar as caixas de seleção dos termos
        setTermsAccepted({
          terms: false,
          dataSharing: false,
          payments: false,
          ccb: false,
        });
      }
    }
  };

  const handleToggleTerm = (termId: keyof typeof termsAccepted) => {
    const termIds = Object.keys(
      termsAccepted
    ) as (keyof typeof termsAccepted)[];
    const currentIndex = termIds.indexOf(termId);

    if (!termsAccepted[termId]) {
      const previousTermsAccepted = termIds
        .slice(0, currentIndex)
        .every((id) => termsAccepted[id]);

      if (!previousTermsAccepted) return;

      setTermsAccepted((prev) => ({
        ...prev,
        [termId]: true,
      }));
    } else {
      setTermsAccepted((prev) => ({
        ...prev,
        ...Object.fromEntries(
          termIds.slice(currentIndex).map((id) => [id, false])
        ),
      }));
    }
  };

  const termsData = [
    {
      id: "terms",
      label:
        "Declaro aceitar os Termos e Condições de Uso e a Política de Privacidade",
    },
    {
      id: "dataSharing",
      label:
        "Autorizo a troca de informações entre Mova e os Parceiros do Produto, para fins de análise de crédito",
    },
    {
      id: "payments",
      label: "Pagamentos em atraso geram multa e juros",
    },
    {
      id: "ccb",
      label: "Autorizo a assinatura da Cédula de Crédito Bancário (CCB)",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9BD13D" />
            <Text style={styles.loadingText}>Carregando renovações...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsDrawerVisible(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="menu" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Renovações</Text>
                <Text style={styles.headerSubtitle}>
                  {list.length} {list.length === 1 ? "renovação" : "renovações"}{" "}
                  disponível{list.length === 1 ? "" : "is"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#9BD13D"]}
              tintColor="#9BD13D"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {list.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="refresh" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                Nenhuma renovação disponível
              </Text>
              <Text style={styles.emptySubtitle}>
                Você não possui renovações disponíveis no momento
              </Text>
            </View>
          ) : (
            list.map((item) => {
              const isSelected = selectedItems === item.id;
              return (
                <TouchableOpacity
                  onPress={() => toggleItemSelection(item.id)}
                  key={item.id}
                  style={[
                    styles.renewCard,
                    isSelected && styles.renewCardSelected,
                  ]}
                >
                  <View style={styles.statusContainer}>
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color="#10B981"
                    />
                    <Text style={styles.statusText}>Ativo</Text>
                  </View>
                  <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                      <Text>Empréstimo de</Text>
                      <Text
                        style={[
                          styles.renewTitle,
                          isSelected && styles.renewTitleSelected,
                        ]}
                      >
                        {formatCurrency(item.loan_value).replace("R$ ", "")}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.selectButton,
                        isSelected && styles.selectButtonSelected,
                      ]}
                      onPress={() => toggleItemSelection(item.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={
                          isSelected ? "check-circle" : "radio-button-unchecked"
                        }
                        size={24}
                        color={isSelected ? "#9BD13D" : "#6B7280"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.highlightedValuesSection}>
                    <View style={styles.highlightedValuesSection}>
                      <View style={styles.highlightedValueRow}>
                        <Text style={styles.highlightedLabel}>
                          IOF (0,63%):
                        </Text>
                        <Text style={styles.highlightedValue}>
                          - R${" "}
                          {(parseFloat(item.loan_value) * 0.0063).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.highlightedValueRow}>
                        <Text style={styles.highlightedLabel}>
                          Taxa T.I.C (1,68%):
                        </Text>
                        <Text style={styles.highlightedValue}>
                          - R${" "}
                          {(parseFloat(item.loan_value) * 0.0168).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.highlightedValueRow}>
                        <Text style={styles.highlightedLabel}>
                          Saldo Devedor:
                        </Text>
                        <Text style={styles.highlightedValue}>
                          - {formatCurrency(item.debt)}
                        </Text>
                      </View>
                      <View style={styles.highlightedValueRow}>
                        <Text style={styles.highlightedLabel}>
                          Quantidade de parcelas:
                        </Text>
                        <Text style={styles.detailRowLabel}>
                          {item.installments}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.highlightedValueRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Valor a Receber:</Text>
                      <Text style={styles.totalValue}>
                        {formatCurrency(item.to_receive)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
        {selectedItems > 0 && (
          <View
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderTopWidth: 1,
              borderTopColor: "rgba(155, 209, 61, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                marginBottom: 8,
                color: "#6B7280",
              }}
            >
              Renovação selecionada
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#9BD13D",
                paddingVertical: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#84CC16",
              }}
              onPress={() => {
                setTermsModalVisible(true);
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                Fazer Empréstimo
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
      <DrawerMenu
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
      {/* Modal dos Termos e Condições */}
      <Modal visible={termsModalVisible} animationType="slide">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            {/* Header do Modal */}
            <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
              <Text className="text-xl font-bold">Termos e Condições</Text>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Conteúdo do Modal */}
            <ScrollView
              className="flex-1 p-5"
              contentContainerStyle={{ paddingBottom: 150 }}
            >
              {/* Seções dos Termos */}
              <View className="gap-6 mb-8">
                <View>
                  <Text className="text-lg font-semibold mb-2">
                    1. Termos de Uso
                  </Text>
                  <Text className="text-gray-700">
                    Os Termos de Uso definem as condições para utilizar os
                    serviços do banco, incluindo a conta digital e produtos
                    financeiros.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    2. Política de Privacidade
                  </Text>
                  <Text className="text-gray-700">
                    Detalha a coleta, armazenamento e uso dos dados pessoais dos
                    clientes, garantindo segurança e transparência.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    3. Contrato de Empréstimo (CCB)
                  </Text>
                  <Text className="text-gray-700">
                    Registra os detalhes do empréstimo concedido, incluindo
                    prazos, taxas e obrigações do cliente.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    4. Termos de Adesão à Conta Digital
                  </Text>
                  <Text className="text-gray-700">
                    Regulamenta a criação e uso da conta digital, com regras
                    sobre movimentações e tarifas aplicáveis.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    5. Política de Pagamentos e Reembolsos
                  </Text>
                  <Text className="text-gray-700">
                    Define os métodos aceitos para pagamentos, prazos de
                    compensação e regras para reembolsos.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    6. Termos de Segurança e Autenticação
                  </Text>
                  <Text className="text-gray-700">
                    Explica medidas de proteção contra fraudes, como
                    autenticação em duas etapas e monitoramento de atividades
                    suspeitas.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    7. Política de Combate à Fraude
                  </Text>
                  <Text className="text-gray-700">
                    Estabelece diretrizes para a prevenção de fraudes e lavagem
                    de dinheiro, conforme normas regulatórias.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    8. Política de Atendimento ao Cliente
                  </Text>
                  <Text className="text-gray-700">
                    Define canais de suporte, tempo médio de resposta e regras
                    para reclamações e contestações.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    9. Termos de Encerramento de Conta
                  </Text>
                  <Text className="text-gray-700">
                    Especifica os procedimentos para encerrar a conta, incluindo
                    quitação de débitos pendentes.
                  </Text>
                </View>

                <View>
                  <Text className="text-lg font-semibold mb-2">
                    10. Política de Atualização de Termos
                  </Text>
                  <Text className="text-gray-700">
                    Explica que os termos podem ser alterados e como os clientes
                    serão informados sobre as mudanças.
                  </Text>
                </View>
              </View>

              {/* Checkboxes dos Termos */}
              <View className="gap-4 mb-8">
                {termsData.map((term) => (
                  <TermsCheckbox
                    key={term.id}
                    checked={
                      termsAccepted[term.id as keyof typeof termsAccepted]
                    }
                    onPress={() =>
                      handleToggleTerm(term.id as keyof typeof termsAccepted)
                    }
                    label={term.label}
                    onOpenLink={(type) => {
                      setModalType(type);
                      setModalVisible(true);
                    }}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Botões do Modal refatorados */}
            <View className="p-5 border-t border-gray-200 bg-white">
              <View className="gap-3">
                {/* Botão Aceitar e Continuar */}
                <TouchableOpacity
                  onPress={() => {
                    if (allTermsAccepted) {
                      setTermsModalVisible(false);
                      handleContinue();
                    }
                  }}
                  disabled={!allTermsAccepted || isLoading}
                  style={{
                    backgroundColor:
                      allTermsAccepted && !isLoading
                        ? Colors.primaryColor
                        : "#d1d5db",
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                  }}
                >
                  <View className="flex-row items-center justify-center gap-3">
                    {isLoading ? (
                      <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={allTermsAccepted ? "white" : "#9ca3af"}
                      />
                    )}
                    <Text
                      className={`font-semibold text-base ${
                        allTermsAccepted && !isLoading
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {isLoading ? "Processando..." : "Aceitar e Continuar"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Botão Cancelar */}
                <TouchableOpacity
                  onPress={() => setTermsModalVisible(false)}
                  className="bg-gray-100 border border-gray-300 rounded-xl py-4 px-6 active:bg-gray-200"
                >
                  <View className="flex-row items-center justify-center gap-3">
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#6b7280"
                    />
                    <Text className="text-gray-600 font-semibold text-base">
                      Cancelar
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal de Detalhes dos Termos */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 bg-white p-5">
          <ScrollView>
            <Text className="text-xl font-bold mb-4">
              {modalType === "terms"
                ? "Termos e Condições de Uso"
                : "Política de Privacidade"}
            </Text>
            <ScrollView contentContainerStyle={{ flex: 1 }}>
              <View>
                {modalType === "terms" && (
                  <View>
                    <Text className="font-bold text-lg mb-4 block">
                      PAGAMENTOS
                    </Text>
                    <Text>
                      Lembrando, os pagamentos são diários de segunda à sábado
                      (incluindo feriados), exceto aos domingos. O pagamento das
                      suas parcelas deverá ser realizado apenas pelo nosso site
                      na área de clientes.
                    </Text>
                    <Text className="font-bold text-lg mt-6 mb-4 block">
                      MULTAS E JUROS POR ATRASO
                    </Text>
                    <Text>
                      Em casos de atrasos no pagamento, ocorrerá uma
                      renegociação automática de sua dívida conforme acordado em
                      contrato. Esta penalidade acontece a cada 2 (dois)
                      atrasos. O valor acrescentado será de 5% sobre o valor
                      total financiado. O valor da penalidade será lançado em
                      forma de uma parcela extra em seu contrato, tendo a data
                      de pagamento para um dia após a sua última parcela
                      lançada.
                    </Text>
                    <Text className="font-bold text-lg mt-6 mb-4 block">
                      RENOVAÇÕES
                    </Text>
                    <Text>
                      O aumento de limite é progressivo de R$300,00 em R$300,00
                      a cada renovação, podendo chegar até o valor máximo de
                      R$1.500,00. Para renovar o seu empréstimo você deve
                      atender as condições, que estão disponíveis na sua área do
                      cliente, em nosso site.
                    </Text>
                  </View>
                )}

                {modalType === "privacy" && (
                  <View
                    style={{
                      flex: 1,
                      marginBottom: 20,
                      borderRadius: 8,
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      minHeight: 600,
                    }}
                  >
                    <WebView
                      originWhitelist={["*"]}
                      source={{ html: htmlContent }}
                      style={{ flex: 1 }}
                      showsVerticalScrollIndicator={true}
                      showsHorizontalScrollIndicator={false}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                      scalesPageToFit={false}
                      startInLoadingState={true}
                      javaScriptEnabled={false}
                      domStorageEnabled={false}
                      allowsInlineMediaPlayback={false}
                      mediaPlaybackRequiresUserAction={true}
                      bounces={false}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          </ScrollView>
          <Pressable
            onPress={() => setModalVisible(false)}
            style={{
              padding: 15,
              backgroundColor: "#eee",
              borderRadius: 8,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text>Fechar</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gradientBackground: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(155, 209, 61, 0.1)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  renewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.5)",
  },
  renewCardSelected: {
    borderColor: "#9BD13D",
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  renewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  renewTitleSelected: {
    color: "#222222",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
    marginLeft: 4,
  },
  selectButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(155, 209, 61, 0.1)",
  },
  selectButtonSelected: {
    backgroundColor: "rgba(139, 195, 74, 0.2)",
  },
  mainValuesContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(155, 209, 61, 0.1)",
  },
  valueItem: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  loanValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9BD13D",
  },
  debtValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EF4444",
    textAlign: "center",
  },
  receiveValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
    textAlign: "center",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    backgroundColor: "rgba(155, 209, 61, 0.05)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.4)",
  },
  detailIconContainer: {
    marginRight: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  paidValue: {
    color: "#10B981",
  },
  pendingValue: {
    color: "#F59E0B",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9BD13D",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  highlightedValuesSection: {
    borderRadius: 12,
  },
  highlightedValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  highlightedLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  highlightedValue: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#9BD13D",
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    color: "#059669",
    fontWeight: "bold",
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailRowLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailRowValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  warningSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    marginLeft: 8,
    lineHeight: 16,
  },
});
