import React from "react";

import { MenuIAChat } from "@menuia/react-native";
import { useNotificationsStore } from "@/store/notifications";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MenuIAProps {
  user: {
    nome: string;
    email: string;
    whatsapp: string;
    cpf: string;
  };
  widgetId?: string;
}

const MenuIAChatComponent: React.FC<MenuIAProps> = ({
  user,
  widgetId = "75968a3e-7e74-41af-9bd2-453797409da8",
}) => {
  const { pushToken } = useNotificationsStore.getState();
  return (
    <MenuIAChat
      widgetId={widgetId}
      primaryColor="#32e10e"
      metadata={{
        name: user?.nome || "",
        email: user?.email || "",
        phone: user?.whatsapp || "",
      }}
      customFields={{ cpf: user?.cpf || "" }}
      onMessage={(msg) => console.log("Nova mensagem:", msg)}
      expoPushToken={pushToken || ""}
    />
  );
};

export default MenuIAChatComponent;
