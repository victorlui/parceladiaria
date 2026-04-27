import { useAuthStore } from "@/store/auth";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import AlertMessage from "./components/alert";
import HeaderHome from "@/pages/home/components/header";
import MenuIcon from "@/pages/home/components/menu-icon";
import HistoryRecent from "@/pages/home/components/history-recent";
import StatusDocModal from "@/pages/home/components/StatusDocModal";
import RefinancingModal from "@/pages/home/components/RefinancingModal";
import MenssagemModal from "@/pages/home/components/mensage-modal";

const HomeScreen: React.FC = () => {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState<
    "status" | "refinanciamento" | null
  >(null);

  useEffect(() => {
    if (user?.status_doc?.toLowerCase() === "divergente") {
      setModalVisible("status");
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (typeof user?.refinanciamento === "string") {
        setModalVisible("refinanciamento");
      }
    }, [user]),
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
      router.push("/divergencia_old_docs_screen");
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
      />
      <MenssagemModal
        visible={user?.lastLoan?.blocked ?? false}
        onClose={() => setModalVisible(null)}
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
});

export default HomeScreen;
