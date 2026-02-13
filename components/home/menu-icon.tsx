import React from "react";
import { View, Text, TouchableOpacity, Animated, Linking } from "react-native";
import CircleIcon from "@/components/ui/CircleIcon";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { SkeletonItem } from "../ui/Skeleton";
import { router } from "expo-router";

interface MenuItemProps {
  available: boolean;
  loading: boolean;
}

const MenuIcon: React.FC<MenuItemProps> = ({ available, loading }) => {
  const items: Item[] = [
    {
      key: "renew",
      title: "Renovar Empréstimo",
      icon: <FontAwesome name="refresh" size={24} color="#fff" />,
      available: true,
      onPress: () => {
        router.push("/(tabs)/renew");
      },
    },
    {
      key: "whatsapp",
      title: "Suporte WhatsApp",
      icon: <FontAwesome name="whatsapp" size={28} color="#fff" />,
      available: false,
      onPress: async () => {
        const phoneNumber = "5511952133321";
        const message = "Olá! Poderia me ajudar?";

        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          alert("WhatsApp não está instalado.");
        }
      },
    },
    {
      key: "news",
      title: "Novidades",
      icon: <Ionicons name="megaphone-outline" size={28} color="#fff" />,
      available: false,
      onPress: () => {},
    },
    {
      key: "instagram",
      title: "Instagram",
      icon: <Ionicons name="logo-instagram" size={28} color="#fff" />,
      available: false,
      onPress: async () => {
        const url = "https://www.instagram.com/parceladiaria";
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          alert("Não foi possível abrir o Instagram.");
        }
      },
    },
  ];

  return (
    <View className="flex-row justify-between px-4">
      {loading ? (
        <View className="flex-row justify-between w-full my-5">
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </View>
      ) : (
        items.map((item) => (
          <MenuItem
            key={item.key}
            title={item.title}
            icon={item.icon}
            available={available}
            onPress={item.onPress}
          />
        ))
      )}
    </View>
  );
};

type Item = {
  key: string;
  title: string;
  icon: React.ReactNode;
  available: boolean;
  onPress?: () => void;
};

const MenuItem: React.FC<Item> = ({ title, icon, available, onPress }) => {
  return (
    <Animated.View className="items-center w-[25%] my-5">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="items-center"
      >
        <View className="relative">
          {available && title === "Renovar Empréstimo" && (
            <View className="absolute -top-2 -left-2 bg-red-600 rounded-full px-2 py-1 z-10">
              <Text className="text-white text-[10px]">Disponível</Text>
            </View>
          )}
          <CircleIcon
            icon={icon}
            color="#1EA052"
            size={64}
            gradientColors={["#2CCA6C", "#16A34A"]} // gradiente verde como na imagem
            gradientStart={{ x: 0.1, y: 0.1 }}
            gradientEnd={{ x: 0.9, y: 0.9 }}
          />
        </View>
        <Text className="text-gray-700 text-xs font-semibold mt-2 text-center w-24">
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default MenuIcon;
