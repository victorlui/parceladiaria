import React from "react";
import { View } from "react-native";
import { SkeletonItem } from "../ui/Skeleton";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { getMenuItems } from "@/constants/menuItems";
import { MenuItem } from "./menu-item";

interface MenuItemProps {
  available: boolean;
  loading: boolean;
}

const MenuIcon: React.FC<MenuItemProps> = ({ available, loading }) => {
  const { user } = useAuthStore();
  const items = getMenuItems({ user, router });

  return (
    <View className="flex-row justify-between px-4">
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
            available={available}
            disabled={item.disabled}
            onPress={item.onPress}
          />
        ))
      )}
    </View>
  );
};

export default MenuIcon;
