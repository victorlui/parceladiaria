import HeaderHome from "@/components/home/header";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/auth";

import MenuIcon from "@/components/home/menu-icon";
import { renewStatus } from "@/services/renew";
import HistoryRecent from "@/components/home/history-recent";
import api from "@/services/api";
import { InstallmentsProps } from "@/interfaces/installments";
import { useFocusEffect } from "@react-navigation/native";
import StatusBar from "@/components/ui/StatusBar";
import { useRenewStore } from "@/store/renew";
import { ApiUserData } from "@/interfaces/login_inteface";
import StatusDocModal from "@/components/home/StatusDocModal";
import { router } from "expo-router";
import RefinancingModal from "@/components/home/RefinancingModal";
import { getFromGPS } from "@/services/fromIP";

const HomeScreen: React.FC = () => {
  const { user, token, register } = useAuthStore();
  const { setRenew } = useRenewStore();

  const [available, setAvailable] = useState(false);
  const [installments, setInstallments] = useState<InstallmentsProps[]>([]);
  const [totalInstallments, setTotalInstallments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<ApiUserData | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (userData?.status_doc?.toLowerCase() === "divergente") {
      setStatusModalVisible(true);
    }
  }, [userData]);

  const handleUpdateDocs = () => {
    if (userData && token) {
      //   register(token, userData);
      setStatusModalVisible(false);
      router.push("/divergencia_old_docs_screen");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
        if (typeof user?.refinanciamento === "string") {
          setModalVisible(true);
        }
     
    }, [user]),
  );

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      const getRenew = async () => {
        try {
          const response = await renewStatus();
          const responseClient = await api.get("/v1/client");

          const installmentsData =
            responseClient.data?.data?.data?.lastLoan?.installments;

          if (installmentsData && Array.isArray(installmentsData)) {
            const sorted = installmentsData
              .filter((i: any) => i.paid === "Sim")
              .slice()
              .sort((a: any, b: any) => b.id - a.id);
            setInstallments(sorted);
            setTotalInstallments(installmentsData.length);
          } else {
            setInstallments([]);
            setTotalInstallments(0);
          }

          setAvailable(response.data.data.can_renew);
          setRenew(response.data.data);

          setUserData({
            ...user,
            lastLoan: responseClient.data.data.data.lastLoan,
            pixKey:
              user?.pixKey ?? responseClient.data.data.data.pixKey ?? null,
          });
        } catch (error: any) {
          return error.response;
        } finally {
          setLoading(false);
        }
      };

      getRenew();
    }, []), // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <StatusBar />
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["#fff9e6", "#fff0b3", "#ffecb3"]}
          start={[0, 1]}
          end={[1, 0]}
          style={styles.warning}
        >
          <FontAwesome5 name="shield-alt" size={18} color="#D97706" />
          <Text style={styles.alertaTexto}>
            Para sua segurança, realize pagamento somente através do aplicativo
          </Text>
        </LinearGradient>
        <HeaderHome user={userData} />
        <MenuIcon available={available} loading={loading} />
        <HistoryRecent
          totalInstallments={totalInstallments}
          installments={installments}
          loading={loading}
          loan={userData?.lastLoan}
        />
        <StatusDocModal
          visible={statusModalVisible}
          onUpdate={handleUpdateDocs}
          onClose={() => setStatusModalVisible(false)}
        />

        <RefinancingModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          amount={user?.lastLoan?.installment_amount ?? 0}
          installments={1}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    flexDirection: "column",
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

export default HomeScreen;
