import { getMenuItems } from "@/constants/menuItems";
import { useIndicationHook } from "@/pages/indications/hooks/useIndicationHook";
import { getLoans } from "@/services/loans";
import { renewStatus } from "@/services/renew";
import { useAuthStore } from "@/store/auth";
import { useRenewStore } from "@/store/renew";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SkeletonItem } from "../../../components/ui/Skeleton";
import { MenuItem } from "./menu-item";

const MenuIcon: React.FC = () => {
  const { user } = useAuthStore();
  const { setRenew } = useRenewStore();
  const { foiIndicado, indications, updateTotalLoans } = useIndicationHook();
  const baseItems = getMenuItems({ user, router });
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalLoans, setTotalLoans] = useState<number>(0);

  const items = React.useMemo(() => {
    let nextItems = baseItems;

    if (foiIndicado !== null) {
      nextItems = nextItems.map((item) => {
        if (item.key !== "indications") return item;
        return {
          ...item,
          title: "Benefícios",
          icon: <Ionicons name="gift-outline" size={28} color="white" />,
        };
      });
    }

    if (indications) {
      nextItems = nextItems.map((item) => {
        if (item.key !== "indications") return item;
        return {
          ...item,
          badge: true,
          titleBadge: "Novo",
        };
      });
    }

    if (available) {
      nextItems = nextItems.map((item) => {
        if (item.key !== "renew") return item;
        return {
          ...item,
          badge: true,
          titleBadge: "Disponível",
        };
      });
    }

    return nextItems;
  }, [available, baseItems, foiIndicado, indications, totalLoans]);

  useFocusEffect(
    React.useCallback(() => {
      //   let isActive = true;

      const load = async () => {
        setLoading(true);
        try {
          const response = await renewStatus();
          const loans = await getLoans();
          updateTotalLoans(loans.length);
          setTotalLoans(loans.length);
          setAvailable(response.data.data.can_renew ?? false);
          setRenew(response.data.data);
        } catch (error: any) {
          setAvailable(false);
        } finally {
          setLoading(false);
        }
      };

      load();
    }, [renewStatus]),
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </View>
      ) : (
        items.map((item) => (
          <MenuItem
            key={item.key}
            title={item.title}
            icon={item.icon}
            badge={item.badge}
            titleBadge={item.titleBadge}
            disabled={item.disabled}
            onPress={item.onPress}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginVertical: 12,
  },
  skeletonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 12,
  },
});

export default MenuIcon;
