import { getMenuItems } from "@/constants/menuItems";
import { useIndicationHook } from "@/pages/indications/hooks/useIndicationHook";
import { useAuthStore } from "@/store/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { MenuItem } from "./menu-item";

const MenuIcon: React.FC = () => {
  const { user } = useAuthStore();
  const { foiIndicado, indications } = useIndicationHook();
  const baseItems = getMenuItems({ user, router });

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

    return nextItems;
  }, [baseItems, foiIndicado, indications]);

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <MenuItem
          key={item.key}
          title={item.title}
          icon={item.icon}
          badge={item.badge}
          titleBadge={item.titleBadge}
          disabled={item.disabled}
          onPress={item.onPress}
        />
      ))}
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
