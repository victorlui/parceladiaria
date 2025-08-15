// import { useAuthStore } from "@/store/auth"; // Removido pois não está sendo usado
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert, // Adicione esta importação
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ClientInfo,
  gerarQRCode,
  getLoanActive,
  getLoansOpen,
} from "@/services/loans";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DrawerMenu from "@/components/DrawerMenu";
import Spinner from "@/components/Spinner";
import { format, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/Colors";
import { PropsQRCode, useQRCodeStore } from "@/store/qrcode";
import { renewList, renewStatus } from "@/services/renew";
import { useAuthStore } from "@/store/auth";

interface Installment {
  id: number;
  description: string;
  installment: string;
  due_date: string;
  amount: number;
  paid: string;
  data: string;
}

// Custom checkbox component
const Checkbox: React.FC<{ checked: boolean }> = ({ checked }) => {
  return (
    <View
      className={`w-6 h-6 rounded-full mr-3 items-center justify-center ${
        checked ? "bg-blue-500" : "bg-gray-200"
      }`}
    >
      {checked && <Text className="text-white font-bold">✓</Text>}
    </View>
  );
};

// Dashboard Card Component
const DashboardCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  iconName: string;
  iconColor: string;
  isSmallScreen?: boolean;
}> = ({ title, value, subtitle, iconName, iconColor, isSmallScreen }) => {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: isSmallScreen ? 12 : 16,
        borderRadius: 16,
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <MaterialIcons
          name={iconName as any}
          size={isSmallScreen ? 16 : 20}
          color={iconColor}
        />
        <Text
          style={{
            color: "#6B7280",
            fontSize: isSmallScreen ? 11 : 12,
            marginLeft: 6,
            fontWeight: "500",
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>
      <Text
        style={{
          color: "#1F2937",
          fontSize: isSmallScreen ? 16 : 20,
          fontWeight: "bold",
          lineHeight: isSmallScreen ? 20 : 24,
        }}
      >
        {value}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: isSmallScreen ? 10 : 11,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const {setCanRenew} = useAuthStore()
  const { setQRCodeData } = useQRCodeStore();
  const [loanActive, setLoanActive] = useState<ClientInfo>();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>(
    []
  );
  const [selectAll, setSelectAll] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const isSmallScreen = screenWidth < 380;
  const [statusRenew, setStatusRenew] = useState<any>({
    can_renew: false,
    date: "",
    message: "",
  });

  useEffect(() => {
    const getRenew = async () => {
      try {
        const response = await renewStatus();
        console.log("res status renovação", response);
        setCanRenew(response.data.data.can_renew)
        setStatusRenew(response.data.data);
      } catch (error: any) {
        console.log("error de status renovação", error.response);
        setStatusRenew({
          can_renew: false,
          date: "",
          message: "Erro ao buscar status de renovação",
        });
      }
    };

    getRenew();
  }, [setCanRenew]);

  // Função para formatar moeda
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  // Dados do dashboard calculados dinamicamente
  const dashboardData = useMemo(
    () => ({
      totalEmprestimos: formatCurrency(
        Number(loanActive?.data.lastLoan.amount || 0)
      ),
      parcelasAbertas: installments.length,
      totalPendente: installments.reduce((sum, item) => sum + item.amount, 0),
      parcelasVencidas: installments.filter((item) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = parseISO(item.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return isBefore(dueDate, today);
      }).length,
    }),
    [loanActive, installments, formatCurrency]
  );

  // Função para buscar dados do empréstimo
  const fetchLoanData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getLoanActive();
      const response_list = await getLoansOpen(response.data.data.lastLoan.id);
      const unpaidInstallments = response_list.data.data.filter(
        (item: Installment) => item.paid === "Não"
      );

      setLoanActive(response.data);
      setInstallments(unpaidInstallments);

      // Sempre selecionar a primeira parcela disponível
      if (unpaidInstallments.length > 0) {
        setSelectedInstallments([unpaidInstallments[0].id]);
        setSelectAll(unpaidInstallments.length === 1);
      } else {
        setSelectedInstallments([]);
        setSelectAll(false);
      }
    } catch (error) {
      return error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar dados inicialmente
  useEffect(() => {
    fetchLoanData();
  }, [fetchLoanData]);

  // Atualizar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      fetchLoanData();
    }, [fetchLoanData])
  );

  // Função para alternar seleção de parcela
  const toggleInstallment = useCallback((id: number) => {
    setSelectedInstallments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Função para verificar se a parcela está vencida
  const isOverdue = useCallback((date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = parseISO(date);
    dueDate.setHours(0, 0, 0, 0);
    return isBefore(dueDate, today);
  }, []);

  // Valor total das parcelas selecionadas
  const selectedAmount = useMemo(() => {
    return installments
      .filter((item) => selectedInstallments.includes(item.id))
      .reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
  }, [installments, selectedInstallments]);

  // Valor total pendente
  const totalPendingAmount = useMemo(() => {
    return installments.reduce((total, installment) => {
      return total + (parseFloat(String(installment.amount)) || 0);
    }, 0);
  }, [installments]);

  // Atualizar estado de "selecionar todas"
  useEffect(() => {
    if (installments.length > 0) {
      const allSelected = installments.every((item) =>
        selectedInstallments.includes(item.id)
      );
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedInstallments, installments]);

  // Número de parcelas vencidas
  const overdueInstallments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return installments.filter((installment) => {
      const dueDate = parseISO(installment.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return isBefore(dueDate, today);
    }).length;
  }, [installments]);

  // Função para gerar QR Code e navegar
  const handleGenerateQRCode = useCallback(async () => {
    if (selectedInstallments.length === 0) return;

    try {
      setIsGeneratingQR(true);
      const qrCodeData = await gerarQRCode(selectedInstallments);
      setQRCodeData(qrCodeData as PropsQRCode);
      router.push("/(app)/qr_code_screen");
    } catch (error: unknown) {
      console.error("Erro ao gerar QR Code:", error);
    } finally {
      setIsGeneratingQR(false);
    }
  }, [selectedInstallments, setQRCodeData]);

  // Função para alternar seleção de todas as parcelas
  const handleToggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedInstallments([]);
      setSelectAll(false);
    } else {
      setSelectedInstallments(installments.map((item) => item.id));
      setSelectAll(true);
    }
  }, [selectAll, installments]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
        style={{ flex: 1 }}
      >
        {/* Header Fixo */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 24,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(155, 209, 61, 0.1)",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <TouchableOpacity
                onPress={() => setIsDrawerVisible(true)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: "rgba(155, 209, 61, 0.1)",
                  marginRight: 12,
                  width: 50,
                  height: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="menu" size={24} color="#1F2937" />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#1F2937",
                    fontSize: isSmallScreen ? 20 : 24,
                    fontWeight: "bold",
                  }}
                >
                  Olá {loanActive?.name?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')},
                </Text>
                {/* Status de Renovação */}
             
              </View>
            </View>
            <Image
              source={require("@/assets/images/apenas-logo.png")}
              style={{
                width: isSmallScreen ? 40 : 50,
                height: isSmallScreen ? 40 : 50,
                resizeMode: "contain",
              }}
            />
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Remover este bloco completamente */}
          {/* <View style={{
                  backgroundColor: statusRenew.can_renew ? '#4CAF50' : '#FF5252',
                  padding: 8,
                  paddingHorizontal:30,
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: '500'
                  }}>
                    {statusRenew.can_renew
                      ? "Você está apto para renovação"
                      : "Você não está apto para renovação"}
                  </Text>
                </View> */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 5 }}>
            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end'}}>
                 <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 8
                }}>
                  <View style={{
                    backgroundColor: statusRenew.can_renew ? '#E8F5E8' : '#FFF2F2',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 3,
                      backgroundColor: statusRenew.can_renew ? '#9BD13D' : '#FF5252',
                      marginRight: 6
                    }} />
                    <Text style={{
                      color: statusRenew.can_renew ? '#2E7D32' : '#C62828',
                      fontSize: isSmallScreen ? 10 : 14,
                      fontWeight: '500'
                    }}>
                      {statusRenew.can_renew ? 'Apto para renovação' : 'Não apto para renovação'}
                    </Text>
                  </View>
                </View>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              <DashboardCard
                title="Empréstimo ativo"
                value={dashboardData.totalEmprestimos.toLocaleString()}
                iconName="account-balance"
                iconColor="#9BD13D"
                isSmallScreen={isSmallScreen}
              />
              <DashboardCard
                title="Parcelas pendentes"
                value={installments.length.toString()}
                iconName="assignment"
                iconColor="#3B82F6"
                isSmallScreen={isSmallScreen}
              />
            </View>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <DashboardCard
                title="Valor pendente"
                value={formatCurrency(totalPendingAmount)}
                iconName="attach-money"
                iconColor="#F59E0B"
                isSmallScreen={isSmallScreen}
              />
              <DashboardCard
                title="Parcelas vencidas"
                value={`${overdueInstallments}`}
                subtitle=""
                iconName="warning"
                iconColor="#EF4444"
                isSmallScreen={isSmallScreen}
              />
            </View>
          </View>

          {/* Card de Segurança */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              marginHorizontal: 20,
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="security"
                size={24}
                color="#EF4444"
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#EF4444",
                    fontSize: isSmallScreen ? 12 : 14,
                    lineHeight: isSmallScreen ? 16 : 20,
                    fontWeight: "500",
                  }}
                >
                  Para sua segurança, realize pagamentos somente através do
                  nosso aplicativo.
                </Text>
              </View>
            </View>
          </View>

          {/* Cabeçalho das Parcelas */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: "#1F2937",
                fontSize: isSmallScreen ? 18 : 20,
                fontWeight: "bold",
              }}
            >
              Parcelas em Aberto
            </Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={handleToggleSelectAll}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderColor: selectAll ? "#9BD13D" : "#9CA3AF",
                  borderRadius: 4,
                  marginRight: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selectAll ? "#9BD13D" : "transparent",
                }}
              >
                {selectAll && (
                  <Text
                    style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                  >
                    ✓
                  </Text>
                )}
              </View>
              <Text
                style={{
                  color: "#6B7280",
                  fontSize: isSmallScreen ? 12 : 14,
                }}
              >
                Selecionar todas
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ gap: 12 }}>
              {installments.map((item) => {
                const isSelected = selectedInstallments.includes(item.id);
                const isItemOverdue = isOverdue(item.due_date);

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleInstallment(item.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: isSmallScreen ? 12 : 16,
                      borderRadius: 16,
                      borderWidth: 1,
                      backgroundColor: isSelected
                        ? "rgba(155, 209, 61, 0.1)"
                        : isItemOverdue
                          ? "rgba(239, 68, 68, 0.05)"
                          : "#FFFFFF",
                      borderColor: isSelected
                        ? "rgba(155, 209, 61, 0.3)"
                        : isItemOverdue
                          ? "rgba(239, 68, 68, 0.2)"
                          : "#E5E7EB",
                    }}
                  >
                    <Checkbox checked={isSelected} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isSelected
                            ? "#9BD13D"
                            : isItemOverdue
                              ? "#EF4444"
                              : "#1F2937",
                          fontWeight: "600",
                          fontSize: isSmallScreen ? 16 : 18,
                        }}
                      >
                        Parcela {item.installment}
                      </Text>
                      <Text
                        style={{
                          color: isSelected
                            ? "#84CC16"
                            : isItemOverdue
                              ? "#F87171"
                              : "#6B7280",
                          fontSize: isSmallScreen ? 12 : 14,
                          marginTop: 2,
                        }}
                      >
                        Vencimento:{" "}
                        {format(parseISO(item.due_date), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallScreen ? 16 : 18,
                          fontWeight: "bold",
                          color: isSelected
                            ? "#9BD13D"
                            : isItemOverdue
                              ? "#EF4444"
                              : "#1F2937",
                          marginTop: 4,
                        }}
                      >
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {selectedInstallments.length > 0 && (
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
                fontSize: isSmallScreen ? 14 : 16,
                marginBottom: 8,
                color: "#6B7280",
              }}
            >
              {selectedInstallments.length} parcela(s) selecionada(s)
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: isSmallScreen ? 16 : 18,
                marginBottom: 16,
                color: "#1F2937",
                fontWeight: "bold",
              }}
            >
              Total: {formatCurrency(selectedAmount)}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: isGeneratingQR ? "#9CA3AF" : "#9BD13D",
                paddingVertical: isSmallScreen ? 12 : 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isGeneratingQR ? "#6B7280" : "#84CC16",
                opacity: isGeneratingQR ? 0.7 : 1,
              }}
              onPress={handleGenerateQRCode}
              disabled={isGeneratingQR || selectedInstallments.length === 0}
            >
              {isGeneratingQR ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: isSmallScreen ? 16 : 18,
                    }}
                  >
                    Gerando QR Code...
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: isSmallScreen ? 16 : 18,
                  }}
                >
                  Pagar Parcelas
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <DrawerMenu
          isVisible={isDrawerVisible}
          onClose={() => setIsDrawerVisible(false)}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;
