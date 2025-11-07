import StatusBar from "@/components/ui/StatusBar";
import { RenewListProps } from "@/interfaces/renew";
import { renewList } from "@/services/renew";
import { useFocusEffect, router } from "expo-router";
import React from "react";
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
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import ItemRenew from "@/components/renew/item-renew";
import ModalConfirm from "@/components/renew/modal-confirm";
import { useAuthStore } from "@/store/auth";
import api from "@/services/api";

const RenewList: React.FC = () => {
  const { user, setUser } = useAuthStore((state) => state);
  const [list, setList] = React.useState<RenewListProps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedItem, setSelectedItem] = React.useState<RenewListProps | null>(
    null
  );
  const [pixKey, setPixKey] = React.useState<string | null>(null);

  const fetchRenewList = async () => {
    try {
      setLoading(true);
      const response = await renewList();
      const responseClient = await api.get("/v1/client");

      setPixKey(responseClient.data?.data.data.pixKey || null);
      const renewWithSelection = response.map((item) => ({
        ...item,
        selected: false,
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
      fetchRenewList();
    }, [])
  );

  const handleSelect = (item: RenewListProps) => {
    setSelectedId(item.id);
    setSelectedItem(item);
    setList((prev) =>
      prev.map((i) => ({
        ...i,
        selected: i.id === item.id,
      }))
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

  console.log("selectedItem", selectedItem);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar />

      <ModalConfirm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedAmount={Number(selectedItem?.loan_value) || 0}
        youReceive={Number(selectedItem?.to_receive) || 0}
        pixKey={pixKey || ""}
        idLoan={selectedItem?.id || 0}
      />

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
});

export default RenewList;
