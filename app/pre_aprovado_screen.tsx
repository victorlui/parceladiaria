import { useAuthStore } from "@/store/auth";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { TermsCheckbox } from "@/components/TermsCheckbox";
import { SafeAreaView } from "react-native-safe-area-context";

import { Etapas } from "@/utils";
import { updateUserService } from "@/services/register";
import { Ionicons } from "@expo/vector-icons";
import DrawerMenu from "@/components/DrawerMenu";
import { Colors } from "@/constants/Colors";
import * as Network from "expo-network";
import { acceptedTerms } from "@/services/terms";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import WebView from "react-native-webview";

const { width } = Dimensions.get("window");
const isTablet = width > 768;

export default function PreAprovadoScreen() {
  const { logout, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState({
    terms: false,
    dataSharing: false,
    payments: false,
    ccb: false,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
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

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleMenuPress = () => {
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  const allTermsAccepted = Object.values(termsAccepted).every((value) => value);
  const phoneNumber = "++5511960882293";
  const message =
    "Olá! Aceitei os Termos e Condições. Vamos fazer a videochamada?";

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const openWhatsApp = async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("WhatsApp não está instalado ou não pode abrir o link.");
    }
  };

  const handleContinue = async () => {
    if (allTermsAccepted) {
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
          sign_info_city: user?.cidade ?? "",
          sign_info_state: user?.estado ?? "",
          sign_info_country: "BR",
        };
        console.log("terms", termsData);
        await acceptedTerms(termsData);
        Alert.alert(
          "Sucesso",
          `Agora entraremos em contato para chamada de vídeo para finalizar o processo`,
          [
            {
              text: "OK",
              onPress: () => {
                openWhatsApp();

                logout();
                router.replace("/login");
              },
            },
          ]
        );
      } catch (error) {
        console.error("Error uploading documents:", error);
      } finally {
        setIsLoading(false);
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

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-gradient-to-b from-green-50 to-white"
    >
      {/* Container principal com padding responsivo */}
      <View className={`flex-1 ${isTablet ? "px-12 py-8" : "px-6 py-4"}`}>
        {/* Header com logo e menu */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={handleMenuPress} className="p-2">
            <Ionicons name="menu" size={28} color="#374151" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Image
              source={require("@/assets/images/apenas-logo.png")}
              className={`w-full ${isTablet ? "h-32" : "h-24"}`}
              resizeMode="contain"
            />
          </View>

          <View className="w-12" />
        </View>

        {/* Renderização condicional baseada em user?.termos */}
        {user?.termos === 1 ? (
          // Conteúdo para videochamada (termos = 1)
          <>
            {/* Card de videochamada */}
            <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-6 border border-gray-100">
              <View className="items-center">
                {/* Ícone de videochamada */}
                <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-blue-100">
                  <Ionicons name="videocam" size={32} color="#3b82f6" />
                </View>

                {/* Título */}
                <Text
                  className={`font-bold text-center mb-3 ${
                    isTablet ? "text-3xl" : "text-2xl"
                  } text-gray-800 leading-tight`}
                >
                  Hora da videochamada!
                </Text>

                {/* Subtítulo */}
                <Text
                  className={`text-center text-gray-600 leading-relaxed ${
                    isTablet ? "text-lg" : "text-base"
                  }`}
                >
                  Agora vamos fazer uma videochamada para finalizar seu cadastro.
                </Text>

                {/* Badge de status */}
                <View className="mt-4 px-4 py-2 rounded-full bg-blue-100">
                  <Text className="font-semibold text-sm text-blue-800">
                    VIDEOCHAMADA AGENDADA
                  </Text>
                </View>
              </View>
            </View>

            {/* Conteúdo central para videochamada */}
            <View className="flex-1 justify-center items-center px-4">
              <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-8 border border-gray-100">
                <View className="items-center">
                  <Text
                    className={`text-center text-gray-600 leading-relaxed ${
                      isTablet ? "text-lg" : "text-base"
                    } mb-6`}
                  >
                    Clique no botão abaixo para iniciar a videochamada via WhatsApp e finalizar seu processo de cadastro.
                  </Text>

                  <Text
                    className={`text-center text-gray-500 ${
                      isTablet ? "text-base" : "text-sm"
                    }`}
                  >
                    Nossa equipe está pronta para atendê-lo!
                  </Text>
                </View>
              </View>
            </View>

            {/* Botões para videochamada */}
            <View className="px-6 pb-6 pt-4">
              <View className="gap-3">
                {/* Botão principal - Iniciar Videochamada */}
                <TouchableOpacity
                  onPress={openWhatsApp}
                  className="rounded-xl py-4 px-6"
                  style={{ backgroundColor: Colors.primaryColor }}
                >
                  <View className="flex-row items-center justify-center gap-3">
                    <Ionicons name="videocam" size={20} color="white" />
                    <Text className="text-white font-semibold text-base">
                      Fazer Videochamada Agora
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Botão secundário - Sair */}
                <TouchableOpacity
                  onPress={handleLogout}
                  className="bg-gray-100 border border-gray-300 rounded-xl py-4 px-6 active:bg-gray-200"
                >
                  <View className="flex-row items-center justify-center gap-3">
                    <Ionicons name="log-out-outline" size={20} color="#6b7280" />
                    <Text className="text-gray-600 font-semibold text-base">
                      Sair
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          // Conteúdo original para aceitar termos (termos = 0 ou undefined)
          <>
            {/* Card principal com informações de pré-aprovação */}
            <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-6 border border-gray-100">
              <View className="items-center">
                {/* Ícone de status */}
                <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-green-100">
                  <Text className="text-2xl text-green-600">✅</Text>
                </View>

                {/* Título principal */}
                <Text
                  className={`font-bold text-center mb-3 ${
                    isTablet ? "text-3xl" : "text-2xl"
                  } text-gray-800 leading-tight`}
                >
                  Você foi pré-aprovado!
                </Text>

                {/* Subtítulo */}
                <Text
                  className={`text-center text-gray-600 leading-relaxed ${
                    isTablet ? "text-lg" : "text-base"
                  }`}
                >
                  Para prosseguir, aceite os termos abaixo:
                </Text>

                {/* Badge de status */}
                <View className="mt-4 px-4 py-2 rounded-full bg-green-100">
                  <Text className="font-semibold text-sm text-green-800">
                    PRÉ-APROVADO
                  </Text>
                </View>
              </View>
            </View>

            {/* Conteúdo central simplificado */}
            <View className="flex-1 justify-center items-center px-4">
              {/* Informações adicionais */}
              <View className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-8 border border-gray-100">
                <View className="items-center">
                  <Text
                    className={`text-center text-gray-600 leading-relaxed ${
                      isTablet ? "text-lg" : "text-base"
                    } mb-6`}
                  >
                    Parabéns! Seu cadastro foi pré-aprovado. Para finalizar o
                    processo, você precisa aceitar nossos termos e condições.
                  </Text>

                  <Text
                    className={`text-center text-gray-500 ${
                      isTablet ? "text-base" : "text-sm"
                    }`}
                  >
                    Clique no botão abaixo para revisar e aceitar os termos.
                  </Text>
                </View>
              </View>
            </View>

            {/* Botões refatorados */}
            <View className="px-6 pb-6 pt-4">
              <View className="gap-3">
                {/* Botão principal - Aceitar Termos */}
                <TouchableOpacity
                  onPress={() => setTermsModalVisible(true)}
                  className="rounded-xl py-4 px-6"
                  style={{ backgroundColor: Colors.primaryColor }}
                >
                  <View className="flex-row items-center justify-center gap-3">
                    <Ionicons name="document-text" size={20} color="white" />
                    <Text className="text-white font-semibold text-base">
                      Revisar e Aceitar Termos
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Botão secundário - Sair */}
                <TouchableOpacity
                  onPress={handleLogout}
                  className="bg-gray-100 border border-gray-300 rounded-xl py-4 px-6 active:bg-gray-200"
                >
                  <View className="flex-row items-center justify-center gap-3">
                    <Ionicons name="log-out-outline" size={20} color="#6b7280" />
                    <Text className="text-gray-600 font-semibold text-base">
                      Sair
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>

      {/* DrawerMenu */}
      <DrawerMenu
        isVisible={isDrawerVisible}
        onClose={handleCloseDrawer}
        showOnlyLogout={true}
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