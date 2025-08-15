import { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  getLoans,
  Loan,
  getLoanInstallments,
  Installment,
} from "@/services/loans";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ptBR } from "date-fns/locale";
import { format, parseISO, differenceInDays, startOfDay } from "date-fns";
import { Colors } from "@/constants/Colors";
import { StatusBar } from "expo-status-bar";
import DrawerMenu from "@/components/DrawerMenu";
import Header from "@/components/Header";

type LoanWithExpanded = Loan & {
  expanded?: boolean;
  animatedHeight?: Animated.Value;
  installments?: Installment[];
  loadingInstallments?: boolean;
};

// Componente de Skeleton Loading
const SkeletonItem = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonLeft}>
        <Animated.View style={[styles.skeletonTitle, { opacity: pulseAnim }]} />
        <Animated.View
          style={[styles.skeletonSubtitle, { opacity: pulseAnim }]}
        />
      </View>
      <View style={styles.skeletonRight}>
        <Animated.View
          style={[styles.skeletonAmount, { opacity: pulseAnim }]}
        />
        <Animated.View
          style={[styles.skeletonStatus, { opacity: pulseAnim }]}
        />
      </View>
    </View>
  );
};

export default function MyLoansScreen() {
  const [loans, setLoans] = useState<LoanWithExpanded[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const fetchLoans = async () => {
    try {
      const loansData = await getLoans();
      const loansWithAnimation = loansData.map((loan) => ({
        ...loan,
        expanded: false,
        animatedHeight: new Animated.Value(0),
      }));
      setLoans(loansWithAnimation);
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLoans();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const toggleLoanExpansion = async (loanId: number) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => {
        if (loan.id === loanId) {
          const newExpanded = !loan.expanded;

          // Se está expandindo e não tem parcelas carregadas
          if (newExpanded && !loan.installments) {
            // Carrega as parcelas
            loadInstallments(loanId);
            // Usa altura inicial menor, será ajustada após carregar parcelas
            Animated.timing(loan.animatedHeight!, {
              toValue: 400, // Altura inicial
              duration: 300,
              useNativeDriver: false,
            }).start();
          } else {
            // Calcula altura dinâmica baseada no número de parcelas
            const baseHeight = 300; // Altura base para informações do empréstimo
            const installmentHeight = loan.installments
              ? loan.installments.length * 60 + 80
              : 100;
            const totalHeight = baseHeight + installmentHeight;

            Animated.timing(loan.animatedHeight!, {
              toValue: newExpanded ? totalHeight : 0,
              duration: 300,
              useNativeDriver: false,
            }).start();
          }

          return { ...loan, expanded: newExpanded };
        }
        return loan;
      })
    );
  };

  const loadInstallments = async (loanId: number) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) =>
        loan.id === loanId ? { ...loan, loadingInstallments: true } : loan
      )
    );

    try {
      const installments = await getLoanInstallments(loanId);
      setLoans((prevLoans) =>
        prevLoans.map((loan) => {
          if (loan.id === loanId) {
            // Recalcula altura após carregar parcelas
            const baseHeight = 300;
            // Aumenta o espaço por parcela para garantir que todas sejam visíveis
            const installmentHeight = installments.length * 73 + 20;

            const totalHeight = baseHeight + installmentHeight;

            // Ajusta a altura da animação
            if (loan.expanded) {
              Animated.timing(loan.animatedHeight!, {
                toValue: totalHeight,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }

            return { ...loan, installments, loadingInstallments: false };
          }

          return loan;
        })
      );
    } catch (error) {
      console.error("Erro ao carregar parcelas:", error);
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.id === loanId ? { ...loan, loadingInstallments: false } : loan
        )
      );
    }
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getStatusColor = (dueDate: string) => {
    const today = startOfDay(new Date());
    const due = startOfDay(parseISO(dueDate));
    const diffDays = differenceInDays(due, today);

    if (diffDays < 0) return "#EF4444"; // Vencido - vermelho
    if (diffDays <= 7) return "#F59E0B"; // Próximo do vencimento - amarelo
    return "#10B981"; // Em dia - verde
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#FAFBFC", "#F8FAFC", "#FFFFFF"]}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9BD13D" />
            <Text style={styles.loadingText}>Carregando empréstimos...</Text>
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
        {/* Header */}
        <Header
          title="Meus Empréstimos"
          subtitle={`${loans.length} ${loans.length === 1 ? "empréstimo" : "empréstimos"}`}
          iconName="wallet"
          iconLibrary="FontAwesome5"
          onMenuPress={() => setIsDrawerVisible(true)}
          showMenuButton={true}
        />

        {/* Loans List */}
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
          {loans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="account-balance-wallet"
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyTitle}>
                Nenhum empréstimo encontrado
              </Text>
              <Text style={styles.emptySubtitle}>
                Você ainda não possui empréstimos ativos
              </Text>
            </View>
          ) : (
            loans.map((loan, index) => (
              <View key={loan.id} style={styles.loanCard}>
                <TouchableOpacity
                  style={styles.loanHeader}
                  onPress={() => toggleLoanExpansion(loan.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.loanMainInfo}>
                    <View style={styles.loanTitleRow}>
                      <Text style={styles.loanTitle}>
                        Empréstimo #{loan.id}
                      </Text>
                    </View>

                    <View style={styles.loanDetailsRow}>
                      <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Valor</Text>
                        <Text style={styles.amountValue}>
                          {formatCurrency(loan.amount)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.expandIcon}>
                    <MaterialIcons
                      name={
                        loan.expanded
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      }
                      size={24}
                      color="#6B7280"
                    />
                  </View>
                </TouchableOpacity>

                {/* Expandable Content */}
                <Animated.View
                  style={[
                    styles.expandableContent,
                    { height: loan.animatedHeight },
                  ]}
                >
                  <View style={styles.loanDetails}>
                    {/* Informações do Empréstimo */}
                    <View style={styles.loanInfoSection}>
                      <Text style={styles.sectionTitle}>
                        Informações do Empréstimo
                      </Text>

                      <View style={styles.detailRow}>
                        <MaterialIcons name="event" size={16} color="#6B7280" />
                        <Text style={styles.detailLabel}>
                          Data do empréstimo:
                        </Text>
                        <Text style={styles.detailValue}>
                          {formatDate(loan.date)}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <MaterialIcons
                          name="percent"
                          size={16}
                          color="#6B7280"
                        />
                        <Text style={styles.detailLabel}>Taxa de juros:</Text>
                        <Text style={styles.detailValue}>
                          {parseFloat(loan.loan_interest).toFixed(0)}%
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <MaterialIcons
                          name="schedule"
                          size={16}
                          color="#6B7280"
                        />
                        <Text style={styles.detailLabel}>Frequência:</Text>
                        <Text style={styles.detailValue}>{loan.frequency}</Text>
                      </View>

                      <View style={styles.detailRow}>
                        <MaterialIcons
                          name="source"
                          size={16}
                          color="#6B7280"
                        />
                        <Text style={styles.detailLabel}>Origem:</Text>
                        <Text style={styles.detailValue}>
                          {loan.origin === "solicitacoes"
                            ? "SOLICITAÇÃO"
                            : loan.origin === "renovacao"
                              ? "RENOVAÇÃO"
                              : loan.origin === "renegociacao"
                                ? "RENEGOCIAÇÕES"
                                : "REFINANCIADO"}
                        </Text>
                      </View>

                      {loan.installment_amount && (
                        <View style={styles.detailRow}>
                          <MaterialIcons
                            name="payment"
                            size={16}
                            color="#6B7280"
                          />
                          <Text style={styles.detailLabel}>
                            Valor da parcela:
                          </Text>
                          <Text style={styles.detailValue}>
                            {formatCurrency(loan.installment_amount)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Seção de Parcelas */}
                    <View style={styles.installmentsSection}>
                      <View style={styles.installmentHeader}>
                        <MaterialIcons name="list" size={20} color="#9BD13D" />
                        <Text style={styles.sectionTitle}>Parcelas</Text>
                      </View>

                      {loan.loadingInstallments ? (
                        <View style={styles.loadingInstallments}>
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#9BD13D" />
                            <Text style={styles.loadingInstallmentsText}>
                              Carregando parcelas...
                            </Text>
                            <Text style={styles.loadingSubtext}>
                              Aguarde um momento
                            </Text>
                          </View>

                          {/* Skeleton Loading */}
                          <View style={styles.skeletonContainer}>
                            {[1, 2, 3].map((item) => (
                              <SkeletonItem key={item} />
                            ))}
                          </View>
                        </View>
                      ) : loan.installments && loan.installments.length > 0 ? (
                        <View style={styles.installmentsList}>
                          {loan.installments.map((installment, idx) => (
                            <View
                              key={installment.id}
                              style={styles.installmentItem}
                            >
                              <View style={styles.installmentInfo}>
                                <Text style={styles.installmentNumber}>
                                  Parcela {installment.installment}
                                </Text>
                                <Text style={styles.installmentDueDate}>
                                  Venc:{" "}
                                  {format(
                                    parseISO(installment.due_date),
                                    "dd/MM/yyyy",
                                    { locale: ptBR }
                                  )}
                                </Text>
                              </View>

                              <View style={styles.installmentAmount}>
                                <Text style={styles.installmentValue}>
                                  {formatCurrency(
                                    installment.amount.toString()
                                  )}
                                </Text>
                                <View
                                  style={[
                                    styles.installmentStatus,
                                    {
                                      backgroundColor:
                                        installment.paid === "Sim"
                                          ? "#10B981"
                                          : getStatusColor(
                                              installment.due_date
                                            ),
                                    },
                                  ]}
                                >
                                  <Text style={styles.installmentStatusText}>
                                    {installment.paid === "Sim"
                                      ? "Pago"
                                      : (() => {
                                          const diffDays = differenceInDays(
                                            startOfDay(
                                              parseISO(installment.due_date)
                                            ),
                                            startOfDay(new Date())
                                          );
                                          if (diffDays < 0) return "Vencido";
                                          if (diffDays <= 7)
                                            return "Próximo ao vencimento";
                                          return "Pendente";
                                        })()}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}

                          <Text style={styles.totalInstallments}>
                            Total: {loan.installments.length} parcelas
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.noInstallments}>
                          Nenhuma parcela encontrada
                        </Text>
                      )}
                    </View>
                  </View>
                </Animated.View>
              </View>
            ))
          )}
        </ScrollView>
      </LinearGradient>

      <DrawerMenu
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 56,
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
  loanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(155, 209, 61, 0.1)",
  },
  loanHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  loanMainInfo: {
    flex: 1,
  },
  loanTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  loanDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9BD13D",
  },
  dateContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  dateLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  expandIcon: {
    marginLeft: 12,
  },
  expandableContent: {
    overflow: "hidden",
  },
  loanDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(155, 209, 61, 0.1)",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  loanInfoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  installmentsSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(155, 209, 61, 0.2)",
    paddingTop: 16,
  },
  installmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  loadingInstallments: {
    paddingVertical: 20,
  },
  // loadingContainer: {
  //   flexDirection: 'column',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   paddingVertical: 20,
  //   marginBottom: 16,
  // },
  loadingInstallmentsText: {
    marginTop: 12,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  skeletonContainer: {
    gap: 8,
  },
  skeletonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(155, 209, 61, 0.05)",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(155, 209, 61, 0.3)",
  },
  skeletonLeft: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    width: "60%",
    backgroundColor: "rgba(155, 209, 61, 0.2)",
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonSubtitle: {
    height: 12,
    width: "40%",
    backgroundColor: "rgba(155, 209, 61, 0.15)",
    borderRadius: 4,
  },
  skeletonRight: {
    alignItems: "flex-end",
  },
  skeletonAmount: {
    height: 14,
    width: 80,
    backgroundColor: "rgba(155, 209, 61, 0.2)",
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonStatus: {
    height: 12,
    width: 50,
    backgroundColor: "rgba(155, 209, 61, 0.15)",
    borderRadius: 6,
  },
  installmentsList: {
    gap: 8,
  },
  installmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(155, 209, 61, 0.05)",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#9BD13D",
  },
  installmentInfo: {
    flex: 1,
  },
  installmentNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  installmentDueDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  installmentAmount: {
    alignItems: "flex-end",
  },
  installmentValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  installmentStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  installmentStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },

  totalInstallments: {
    textAlign: "center",
    fontSize: 14,
    color: "#9BD13D",
    fontWeight: "600",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(155, 209, 61, 0.2)",
  },
  noInstallments: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
    paddingVertical: 20,
  },
});
