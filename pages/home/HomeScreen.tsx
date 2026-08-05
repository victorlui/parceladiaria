import { Colors } from "@/constants/Colors";
import HeaderHome from "@/pages/home/components/header";
import HistoryRecent from "@/pages/home/components/history-recent";
import MenssagemModal from "@/pages/home/components/mensage-modal";
import MenuIcon from "@/pages/home/components/menu-icon";
import RefinancingModal from "@/pages/home/components/RefinancingModal";
import StatusDocModal from "@/pages/home/components/StatusDocModal";
import { useAuthStore } from "@/store/auth";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AcordoModal from "./components/AcordoModal";
import AlertMessage from "./components/alert";
import { getAcordo } from "./service/acordo";
import { AcordoResponse } from "./types/acordo";

const HomeScreen: React.FC = () => {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<
    "status" | "refinanciamento" | null
  >(null);
  const [acordo, setAcordo] = useState<AcordoResponse | null>(null);
  const [acordoVisible, setAcordoVisible] = useState<boolean>(false);

  const loadAcordo = useCallback(async (openModal = false) => {
    try {
      const data = await getAcordo();
      setAcordo(data);

      if (openModal) {
        setAcordoVisible(Boolean(data?.success));
      }
    } catch (error: any) {
      setAcordoVisible(false);
      setAcordo(null);
    }
  }, []);

  useEffect(() => {
    if (user?.status_doc?.toLowerCase() === "divergente") {
      setModalVisible("status");
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      const temRefiLegado = typeof user?.refinanciamento === "string";
      const temRefiV2 = !!user?.refinanciamento_v2;
      if (temRefiLegado || temRefiV2) {
        setModalVisible("refinanciamento");
      }

      loadAcordo(true);
    }, [user, loadAcordo]),
  );

  const installments = useMemo(
    () =>
      user?.lastLoan?.installments
        .filter((i: any) => i.paid === "Sim")
        .slice()
        .sort((a: any, b: any) => b.id - a.id),
    [user],
  );

  const totalInstallments = useMemo(
    () => user?.lastLoan?.installments?.length,
    [user],
  );

  const handleUpdateDocs = () => {
    if (user && token) {
      setModalVisible(null);
      router.push("/divergencia_screen");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <AlertMessage />
        <HeaderHome user={user} />
        <MenuIcon />
        <HistoryRecent
          totalInstallments={totalInstallments ?? 0}
          installments={
            installments?.map((i: any) => ({
              ...i,
              amount: Number(i.amount),
            })) ?? []
          }
          loading={false}
          loan={user?.lastLoan}
        />
      </ScrollView>
      <StatusDocModal
        visible={modalVisible === "status"}
        onUpdate={handleUpdateDocs}
        onClose={() => setModalVisible(null)}
      />
      <RefinancingModal
        visible={modalVisible === "refinanciamento"}
        onClose={() => setModalVisible(null)}
        amount={user?.lastLoan?.installment_amount ?? 0}
        installments={1}
        refinanciamentoV2={user?.refinanciamento_v2 ?? null}
      />
      <MenssagemModal
        visible={user?.lastLoan?.blocked ?? false}
        onClose={() => setModalVisible(null)}
      />
      {acordo?.success ? (
        <TouchableOpacity
          style={styles.floatingButton}
          activeOpacity={0.9}
          onPress={() => setAcordoVisible(true)}
        >
          <Text style={styles.floatingButtonText}>Acordo disponivel</Text>
        </TouchableOpacity>
      ) : null}
      <AcordoModal
        visible={acordoVisible}
        onClose={() => setAcordoVisible(false)}
        onFirmado={() => {
          setAcordoVisible(false);
          setAcordo(null);
        }}
        acordo={acordo}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  floatingButton: {
    position: "absolute",
    left: 20,
    bottom: 28,
    backgroundColor: Colors.green.button,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default HomeScreen;
