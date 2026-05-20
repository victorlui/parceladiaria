import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import { MenuIAChat } from "@menuia/react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat: React.FC = () => {
  const { user, userRegister } = useAuthStore();
  const { data } = useRegisterStore();
  const { pushToken } = useNotificationsStore.getState();

  const currentUser = user || userRegister;

  let widgetId = "75968a3e-7e74-41af-9bd2-453797409da8";

  if (currentUser?.type === "lead") {
    widgetId = "b1a40bb3-47ef-437d-b32a-925af5ff6810";
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
          name: data?.nome || "",
          email: data?.email || "",
          phone: data?.whatsapp || "",
        }}
        customFields={{ cpf: data?.cpf || "" }}
        expoPushToken={pushToken || ""}
      />
    </SafeAreaView>
  );
};

export default Chat;
