import React from "react";
import { MenuIAChat } from "@menuia/react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";

const Chat: React.FC = () => {
  const { user, userRegister } = useAuthStore();
  const { pushToken } = useNotificationsStore.getState();

  const currentUser = user || userRegister;

  let widgetId = "75968a3e-7e74-41af-9bd2-453797409da8";

  if (currentUser?.type === "lead") {
    widgetId = "75968a3e-7e74-41af-9bd2-453797409da8";
  }

  if (currentUser?.type === "client") {
    widgetId = "f7d51017-3e48-40b1-9f02-64f9f3d54256";
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <MenuIAChat
        widgetId={widgetId}
        inline
        primaryColor="#32e10e"
        metadata={{
          name: currentUser?.nome || "",
          email: currentUser?.email || "",
          phone: currentUser?.whatsapp || "",
        }}
        customFields={{ cpf: currentUser?.cpf || "" }}
        expoPushToken={pushToken || ""}
      />
    </SafeAreaView>
  );
};

export default Chat;
