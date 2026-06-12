import { AnalyticsService } from "@/analytics/analytics.service";
import {
  ANALYTICS_FLOWS,
  TAB_ANALYTICS_SOURCES,
  TAB_SCREENS,
} from "@/analytics/events";
import ItemRenew from "@/components/renew/item-renew";
import StatusBar from "@/components/ui/StatusBar";
import { Colors } from "@/constants/Colors";
import { RenewListProps } from "@/interfaces/renew";
import { renewList } from "@/services/renew";
import { useAuthStore } from "@/store/auth";
import { useConfirmPixStore } from "@/store/confirm-pix";
import { formatCurrency } from "@/utils/formats";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RenewList: React.FC = () => {
  const { user } = useAuthStore((state) => state);
  const { setData } = useConfirmPixStore();
  const [list, setList] = React.useState<RenewListProps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // Evita refetch quando o modal for aberto/fechado
  const preventRefetch = React.useRef<boolean>(false);

  const outstandingBalance = useMemo(() => {
    return user?.lastLoan?.installments?.reduce((total, installment) => {
      if (installment.paid === "Sim") return total;
      return total + (parseFloat(String(installment.amount)) || 0);
    }, 0);
  }, [user?.lastLoan]);

  const fetchRenewList = async () => {
    try {
      setLoading(true);
      const response = await renewList({
        flow: ANALYTICS_FLOWS.APP,
        source: TAB_ANALYTICS_SOURCES.RENEW_LIST,
      });

      const renewWithSelection = response.map((item) => ({
        ...item,
        selected: item.id === selectedId,
      }));
      setList(renewWithSelection as RenewListProps[]);
    } catch (error: any) {
      return;
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      AnalyticsService.screen(TAB_SCREENS.RENEW_LIST, {
        flow: ANALYTICS_FLOWS.APP,
      });
      // Se o foco voltou por causa do modal, não refaz o fetch
      if (preventRefetch.current) {
        preventRefetch.current = false;
        return;
      }
      fetchRenewList();
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSelect = (item: RenewListProps) => {
    setSelectedId(item.id);
    setData({
      value: item.loan_value,
      to_receive: item.to_receive,
      isLoan: true,
      id: item.id,
    });
    setList((prev) =>
      prev.map((i) => ({
        ...i,
        selected: i.id === item.id,
      })),
    );
  };

  const renderItem = ({ item }: { item: RenewListProps }) => {
    return (
      <ItemRenew
        item={item}
        onPress={() => handleSelect(item)}
        selectedId={selectedId}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar />

      {/* Header com voltar e título */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={Colors.green.primary}
          />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Renovar Empréstimo</Text>
        <Text style={styles.headerSubtitle}>Escolha o valor da renovação</Text>

        {outstandingBalance !== undefined && outstandingBalance > 0 && (
          <LinearGradient
            colors={["#fff9e6", "#fff0b3", "#ffecb3"]}
            start={[0, 1]}
            end={[1, 0]}
            style={styles.warning}
          >
            <FontAwesome5 name="info-circle" size={18} color="#D97706" />
            <Text style={styles.alertaTexto}>
              A renovação quita automaticamente seu débito atual de (
              {formatCurrency(outstandingBalance || 0)})
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Lista */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.green.primary} />
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Botão confirmar fixo no rodapé */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => {
            // if (!selectedId) return;
            // // Marca para não refazer o fetch ao recuperar foco
            // preventRefetch.current = true;
            // setModalVisible(true);
            router.push("/(app)/confirm-pix");
          }}
          disabled={!selectedId}
        >
          <FontAwesome name="check" size={20} color="#fff" />
          <Text style={styles.confirmButtonText}>Confirmar Renovação</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },

  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: Colors.green.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.green.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    backgroundColor: "#fff9e6",
    borderLeftWidth: 5,
    borderColor: "#D97706",
    borderRadius: 12,
    marginVertical: 10,
  },
  alertaTexto: {
    flex: 1, // Permite que o texto ocupe o espaço restante
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontFamily: "System", // Use a fonte padrão ou uma fonte customizada do Expo
    color: "#5d4037", // Cor do texto (marrom escuro)
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default RenewList;
