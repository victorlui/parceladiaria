import { useAuthStore } from "@/store/auth";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ClientInfo, getLoanActive, getLoansOpen, getRenovacao } from "@/services/loans";
import { useEffect, useMemo, useState, useRef } from "react";
import { Ionicons } from '@expo/vector-icons';
import DrawerMenu from '@/components/DrawerMenu';
import Spinner from '@/components/Spinner';
import { format, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  bgColor: string;
  textColor: string;
  icon?: string;
}> = ({ title, value, subtitle, bgColor, textColor, icon }) => {
  return (
    <View
      className={`${bgColor} p-4 rounded-xl flex-1 mx-1 border border-gray-200`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`${textColor} text-sm opacity-80`}>
          {icon} {title}
        </Text>
        {subtitle && (
          <Text className={`${textColor} text-xs opacity-60`}>{subtitle}</Text>
        )}
      </View>
      <Text className={`${textColor} text-2xl font-bold`}>{value}</Text>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [loanActive, setLoanActive] = useState<ClientInfo>();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [selectedInstallments, setSelectedInstallments] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(1)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 30) {
          Animated.timing(headerHeight, {
            toValue: 0,
            duration: 40,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(headerHeight, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }).start();
        }
      },
    }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const dashboardData = {
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
  };

  useEffect(() => {
    async function fetchLoanActive() {
      try {
        setIsLoading(true);
        const response = await getLoanActive();
        const response_list = await getLoansOpen(
          response.data.data.lastLoan.id
        );
        const unpaidInstallments = response_list.data.data.filter(
          (item: Installment) => item.paid === "Não"
        );
        // const response_renovacao = await getRenovacao();
        // console.log("res",response_renovacao)
        setLoanActive(response.data);
        setInstallments(unpaidInstallments);
      } catch (error) {
        console.error("Error fetching loan data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLoanActive();
  }, []);

  const toggleInstallment = (id: number) => {
    setSelectedInstallments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isOverdue = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas a data
    const dueDate = parseISO(date);
    dueDate.setHours(0, 0, 0, 0); // Zera as horas da data de vencimento
    return isBefore(dueDate, today);
  };

  const valor = useMemo(() => {
    return installments
      .filter((item) => selectedInstallments.includes(item.id))
      .reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
  }, [installments, selectedInstallments]);

  const totalPendingAmount = useMemo(() => {
    return installments.reduce((total, installment) => {
      return total + (parseFloat(String(installment.amount)) || 0);
    }, 0);
  }, [installments]);

  useEffect(() => {
    if (installments.length > 0) {
      const allSelected = installments.every((item) =>
        selectedInstallments.includes(item.id)
      );
      setSelectAll(allSelected);
    }
  }, [selectedInstallments, installments]);

  const overdueInstallments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas a data
    return installments.filter((installment) => {
      const dueDate = parseISO(installment.due_date);
      dueDate.setHours(0, 0, 0, 0); // Zera as horas da data de vencimento
      return isBefore(dueDate, today);
    }).length;
  }, [installments]);

  if (isLoading) {
    return (
      <Spinner />
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white px-6">
      <Animated.View
        style={{
          height: headerHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 300],
            extrapolate: "clamp",
          }),
          opacity: headerHeight,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <View className="mt-8 mb-6">
          <View className="flex-row items-center justify-between">
            <View >
              <TouchableOpacity
              onPress={() => setIsDrawerVisible(true)}
              className="pb-2"
            >
              <Ionicons name="menu" size={28} color="#374151" />
            </TouchableOpacity>
            <Text className="text-gray-800 text-2xl font-bold">
              Olá {loanActive?.name},
            </Text>
            </View>
            
          </View>
        </View>

        <View className="flex-row mb-4 ">
          <DashboardCard
            title="Empréstimo ativo"
            value={dashboardData.totalEmprestimos.toLocaleString()}
            subtitle=""
            bgColor="bg-green-50"
            textColor="text-gray-800"
            icon="📊"
          />
          <DashboardCard
            title="Parcelas pendentes"
            value={installments.length.toString()}
            subtitle=""
            bgColor="bg-green-50"
            textColor="text-gray-800"
            icon="📋"
          />
        </View>

        <View className="flex-row mb-2">
          <DashboardCard
            title="Valor pendente"
            value={formatCurrency(totalPendingAmount)}
            subtitle=""
            bgColor="bg-green-50"
            textColor="text-gray-800"
            icon="💰"
          />
          <DashboardCard
            title="Parcelas vencidas"
            value={`${overdueInstallments} parcelas`}
            subtitle=""
            bgColor="bg-red-50"
            textColor="text-gray-800"
            icon="⚠️"
          />
        </View>
      </Animated.View>

      <View className="p-4 mb-4 mt-2">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">🔒</Text>
          <View className="flex-1">
            <Text className="text-red-500 text-sm leading-5">
              Para sua segurança, realize pagamentos somente através do nosso aplicativo.
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-800 text-xl font-bold">
          Parcelas em Aberto
        </Text>
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => {
            if (selectAll) {
              setSelectedInstallments([]);
              setSelectAll(false);
            } else {
              setSelectedInstallments(installments.map((item) => item.id));
              setSelectAll(true);
            }
          }}
        >
          <View
            className={`w-5 h-5 border-2 border-gray-400 rounded mr-2 items-center justify-center ${
              selectAll ? "bg-green-500 border-green-500" : "bg-transparent"
            }`}
          >
            {selectAll && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
          <Text className="text-gray-600 text-sm">Selecionar todas</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="gap-3">
          {installments.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleInstallment(item.id)}
              className={`flex-row items-center px-4 py-2 rounded-lg border ${
                selectedInstallments.includes(item.id)
                  ? "bg-green-100 border-green-400"
                  : isOverdue(item.due_date)
                    ? "bg-red-50 border-red-300"
                    : "bg-gray-50 border-gray-200"
              }`}
            >
              <Checkbox checked={selectedInstallments.includes(item.id)} />
              <View className="flex-1">
                <Text
                  className={`${
                    selectedInstallments.includes(item.id)
                      ? "text-green-700 font-semibold text-lg"
                      : isOverdue(item.due_date)
                        ? "text-red-600 font-semibold text-lg"
                        : "text-gray-800 font-semibold text-lg"
                  }`}
                >
                  Parcela {item.installment}
                </Text>
                <Text
                  className={`${
                    selectedInstallments.includes(item.id)
                      ? "text-green-600"
                      : isOverdue(item.due_date)
                        ? "text-red-500"
                        : "text-gray-600"
                  }`}
                >
                  Vencimento:{" "}
                  {format(parseISO(item.due_date), "dd/MM/yyyy", { locale: ptBR })}
                </Text>
                <Text
                  className={`text-lg font-bold ${
                    selectedInstallments.includes(item.id)
                      ? "text-green-700"
                      : isOverdue(item.due_date)
                        ? "text-red-600"
                        : "text-gray-800"
                  } mt-1`}
                >
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedInstallments.length > 0 && (
        <View className="py-4 border-t border-gray-200">
          <Text className="text-center text-lg mb-2 text-gray-600">
            {selectedInstallments.length} parcela(s) selecionada(s)
          </Text>
          <Text className="text-center text-lg mb-4 text-gray-800 font-bold">
            Total: {formatCurrency(valor)}
          </Text>
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-lg"
            onPress={() =>
              console.log("Selected installments:", selectedInstallments)
            }
          >
            <Text className="text-white text-center font-bold text-lg">
              Pagar Parcelas
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <DrawerMenu
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
