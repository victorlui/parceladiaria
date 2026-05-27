import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import { MenuIAChat } from "@menuia/react-native";
import { formatISO } from "date-fns";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat: React.FC = () => {
  const { user, userRegister } = useAuthStore();
  const { data } = useRegisterStore();
  const { pushToken } = useNotificationsStore.getState();

  const currentUser = user || userRegister || data;

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
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#0a0a14" }}
    >
      <View style={{ flex: 1, opacity: 0.99 }} collapsable={false}>
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
    </SafeAreaView>
  );
};

export default Chat;
