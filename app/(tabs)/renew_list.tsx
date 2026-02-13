import StatusBar from "@/components/ui/StatusBar";
import { RenewListProps } from "@/interfaces/renew";
import { renewList } from "@/services/renew";
import { useFocusEffect, router } from "expo-router";
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
import { Colors } from "@/constants/Colors";
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import ItemRenew from "@/components/renew/item-renew";
import ModalConfirm from "@/components/renew/modal-confirm";
import { useAuthStore } from "@/store/auth";
import api from "@/services/api";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "@/utils/formats";
import { convertData } from "@/utils";
import * as Network from "expo-network";
import { getFromGPS } from "@/services/fromIP";
import { useAlerts } from "@/components/useAlert";

const RenewList: React.FC = () => {
  const { showSuccess, showError, AlertDisplay } = useAlerts();
  const { user } = useAuthStore((state) => state);
  const [list, setList] = React.useState<RenewListProps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedItem, setSelectedItem] = React.useState<RenewListProps | null>(
    null,
  );
  const [pixKey, setPixKey] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<"confirm" | "change">("confirm");
  const [keyNew, setKeyNew] = React.useState<string>("");
  // Evita refetch quando o modal for aberto/fechado
  const preventRefetch = React.useRef<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  console.log("user", user);

  const outstandingBalance = useMemo(() => {
    return user?.lastLoan?.installments?.reduce((total, installment) => {
      if (installment.paid === "Sim") return total;
      return total + (parseFloat(String(installment.amount)) || 0);
    }, 0);
  }, [user?.lastLoan]);

  const fetchRenewList = async () => {
    try {
      setLoading(true);
      const response = await renewList();
      const responseClient = await api.get("/v1/client");

      setPixKey(responseClient.data?.data.data.pixKey || null);
      // Preserva seleção ao recarregar
      const renewWithSelection = response.map((item) => ({
        ...item,
        selected: item.id === selectedId,
      }));
      setList(renewWithSelection as RenewListProps[]);
    } catch (error: any) {
      console.log("error", error?.response);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
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
    setSelectedItem(item);
    setList((prev) =>
      prev.map((i) => ({
        ...i,
        selected: i.id === item.id,
      })),
    );
  };

  const onConfirmRenew = async () => {
    setIsLoading(true);
    try {
      const ip = await Network.getIpAddressAsync();

      //   const fromIP = await getFromGPS();
      //   console.log("fromIP", fromIP);

      const data = {
        id: selectedId,
        sign_info_date: convertData(),
        sign_info_ip_address: ip,
        sign_info_city: user?.cidade ?? "São Paulo",
        sign_info_state: user?.estado ?? "SP",
        sign_info_country: "BR",
      };

      console.log("data", data);
      const res = await api.post("/v1/renew", data);
      showSuccess("Sucesso", `Renovação concluida com sucesso`, () => {
        router.replace("/");
      });
      console.log("sucesso res", res);
    } catch (error: any) {
      console.log("error  renovação", error.response);
      showError("Atenção", error.response.data.error || "Erro ao renovar");
    } finally {
      setIsLoading(false);
      setModalVisible(false);
    }
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

      <ModalConfirm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setKeyNew("");
          setStep("confirm");
        }}
        onConfirm={() => onConfirmRenew()}
        onStepChange={(step) => {
          setStep(step);
        }}
        step={step}
        valueSelected={Number(selectedItem?.loan_value || 0)}
        valueToReceive={Number(selectedItem?.to_receive || 0)}
        pixKey={pixKey || ""}
        keyNew={keyNew}
        onChangeKey={setKeyNew}
        onSave={() => {
          setKeyNew(keyNew);
          setStep("confirm");
        }}
        isLoading={isLoading}
      />
      <AlertDisplay />

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
            if (!selectedId) return;
            // Marca para não refazer o fetch ao recuperar foco
            preventRefetch.current = true;
            setModalVisible(true);
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
