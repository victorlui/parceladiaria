import { useAuthStore } from "@/store/auth";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/Button";
import { router } from "expo-router";
import { useState } from "react";
import { TermsCheckbox } from "@/components/TermsCheckbox";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useUpdateUserMutation } from "@/hooks/useRegisterMutation";
import { Etapas } from "@/utils";
import { updateUserService } from "@/services/register";

export default function PreAprovadoScreen() {
  const { logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState({
    terms: false,
    dataSharing: false,
    payments: false,
    ccb: false,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const allTermsAccepted = Object.values(termsAccepted).every((value) => value);
  const phoneNumber = "5511960882293";
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
        const requestData = {
          etapa: Etapas.FINALIZADO,
          termos: "1",
        };

        await updateUserService({ request: requestData });
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
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      {/* Conteúdo com rolagem */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 150, // espaço extra para não colar nos botões fixos
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold mb-1 text-center">
            Você foi pré-aprovado!
          </Text>
          <Text className="text-lg text-center">
            Para prosseguir, aceite os termos abaixo:
          </Text>
        </View>

        <View>
          <Text className="text-2xl font-bold mb-6">Termos e Condições</Text>

          <View className="gap-6">
            <View>
              <Text className="text-lg font-semibold mb-2">
                1. Termos de Uso
              </Text>
              <Text className="text-gray-700">
                Os Termos de Uso definem as condições para utilizar os serviços
                do banco, incluindo a conta digital e produtos financeiros.
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
                Registra os detalhes do empréstimo concedido, incluindo prazos,
                taxas e obrigações do cliente.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-semibold mb-2">
                4. Termos de Adesão à Conta Digital
              </Text>
              <Text className="text-gray-700">
                Regulamenta a criação e uso da conta digital, com regras sobre
                movimentações e tarifas aplicáveis.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-semibold mb-2">
                5. Política de Pagamentos e Reembolsos
              </Text>
              <Text className="text-gray-700">
                Define os métodos aceitos para pagamentos, prazos de compensação
                e regras para reembolsos.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-semibold mb-2">
                6. Termos de Segurança e Autenticação
              </Text>
              <Text className="text-gray-700">
                Explica medidas de proteção contra fraudes, como autenticação em
                duas etapas e monitoramento de atividades suspeitas.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-semibold mb-2">
                7. Política de Combate à Fraude
              </Text>
              <Text className="text-gray-700">
                Estabelece diretrizes para a prevenção de fraudes e lavagem de
                dinheiro, conforme normas regulatórias.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-semibold mb-2">
                8. Política de Atendimento ao Cliente
              </Text>
              <Text className="text-gray-700">
                Define canais de suporte, tempo médio de resposta e regras para
                reclamações e contestações.
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
        </View>

        <View className="gap-4 my-8">
          {termsData.map((term) => (
            <TermsCheckbox
              key={term.id}
              checked={termsAccepted[term.id as keyof typeof termsAccepted]}
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

      {/* Botões fixos */}
      <View
        className="absolute  left-0 right-0 bg-white p-5 border-t border-gray-200"
        style={{ bottom: useSafeAreaInsets().bottom }}
      >
        <Button
          title="Aceitar"
          onPress={handleContinue}
          disabled={!allTermsAccepted}
        />
        <View style={{ height: 8 }} />
        <Button title="Sair" onPress={handleLogout} variant="outline" />
      </View>

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
                    <Text className="font-bold text-lg mb-4 block">PAGAMENTOS</Text>
                     <Text>Lembrando, os pagamentos são diários de segunda à sábado (incluindo feriados), exceto aos domingos. O pagamento das suas parcelas deverá ser realizado apenas pelo nosso site na área de clientes.</Text>
                      <Text className="font-bold text-lg mt-6 mb-4 block">MULTAS E JUROS POR ATRASO</Text>
                 <Text>   Em casos de atrasos no pagamento, ocorrerá uma renegociação automática de sua dívida conforme acordado em contrato. Esta penalidade acontece a cada 2 (dois) atrasos. O valor acrescentado será de 5% sobre o valor total financiado. O valor da penalidade será lançado em forma de uma parcela extra em seu contrato, tendo a data de pagamento para um dia após a sua última parcela lançada.</Text>
                    
                    <Text className="font-bold text-lg mt-6 mb-4 block">RENOVAÇÕES</Text>
                    O aumento de limite é progressivo de R$300,00 em R$300,00 a cada renovação, podendo chegar até o valor máximo de R$1.500,00. Para renovar o seu empréstimo você deve atender as condições, que estão disponíveis na sua área do cliente, em nosso site.
                    </View>
                 
                )}

                {modalType === "privacy" && (
                  <Text className="text-base leading-6">
                    Aqui vai o texto completo da Política de Privacidade
                  </Text>
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
