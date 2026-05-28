import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useNotificationsStore } from "@/shared/store/useNotificationsStore";
import { MenuIAChat } from "@menuia/react-native";
import { formatISO } from "date-fns";
import React from "react";
import { View } from "react-native";

const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { pushToken } = useNotificationsStore.getState();

  const currentUser = user;

  let widgetId = "b1a40bb3-47ef-437d-b32a-925af5ff6810";

  if (currentUser?.type === "lead") {
    widgetId = "b1a40bb3-47ef-437d-b32a-925af5ff6810";
  }

  if (currentUser?.type === "client") {
    widgetId = "f7d51017-3e48-40b1-9f02-64f9f3d54256";
  }

  const dataAtual = new Date();

  const dataFormatada = formatISO(dataAtual, { format: "extended" });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }} collapsable={false}>
        <MenuIAChat
          widgetId={widgetId || ""}
          inline
          primaryColor="#32e10e"
          metadata={{
            name: currentUser?.nome || "",
            email: currentUser?.email || "",
            phone: currentUser?.whatsapp || "",
          }}
          customFields={{
            cpf: currentUser?.cpf || "",
            data_horario: dataFormatada,
            origem: "mobile",
          }}
          expoPushToken={pushToken || ""}
        />
      </View>
    </View>
  );
};

export default Chat;
