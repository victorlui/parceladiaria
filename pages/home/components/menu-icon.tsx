import React, { useState } from "react";
import { View } from "react-native";
import { SkeletonItem } from "../../../components/ui/Skeleton";
import { router, useFocusEffect } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { getMenuItems } from "@/constants/menuItems";
import { MenuItem } from "./menu-item";
import { renewStatus } from "@/services/renew";
import { useRenewStore } from "@/store/renew";
import { useIndicationHook } from "@/pages/indications/hooks/useIndicationHook";
import { getLoans } from "@/services/loans";
import { Ionicons } from "@expo/vector-icons";

const MenuIcon: React.FC = () => {
  const { user } = useAuthStore();
  const { setRenew } = useRenewStore();
  const { foiIndicado, indications, updateTotalLoans } = useIndicationHook();
  const baseItems = getMenuItems({ user, router });
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
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
          //   if (!isActive) return;
          console.log("error", error?.response ?? error);
          setAvailable(false);
        } finally {
          //   if (!isActive) return;
          setLoading(false);
        }
      };

      load();
    }, [renewStatus]),
  );

  return (
    <View
      className="flex-row justify-between px-4"
      style={{ marginVertical: 12 }}
    >
      {loading ? (
        <View className="flex-row justify-between w-full my-5">
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

export default MenuIcon;
