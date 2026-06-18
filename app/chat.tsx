import { useAuthStore } from "@/store/auth";
import { useNotificationsStore } from "@/store/notifications";
import { useRegisterStore } from "@/store/register_new";
import { MenuIAChat } from "@menuia/react-native";
import { formatISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Chat: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const authHasHydrated = useAuthStore((state) => state.hasHydrated);

  const registerData = useRegisterStore((state) => state.data);
  const registerToken = useRegisterStore((state) => state.token);
  const registerHydrated = useRegisterStore((state) => state.hydrated);

  const isAuthReady = !!(authHasHydrated && authToken && authUser);
  const isRegisterReady = !!(registerHydrated && registerToken && registerData);

  const widgetId = "b1a40bb3-47ef-437d-b32a-925af5ff6810";

  const dataFormatada = formatISO(new Date(), { format: "extended" });

  const metadata =
    isAuthReady && authUser
      ? {
          name: authUser.nome || "",
          email: authUser.email || "",
          phone: authUser.whatsapp || authUser.phone || "",
        }
      : isRegisterReady && registerData
        ? {
            name: registerData.nome || "",
            email: registerData.email || "",
            phone: registerData.whatsapp || "",
          }
        : {
            name: "Usuário Guest",
            email: "guest@teste.com",
            phone: "",
          };

  const pushToken = useNotificationsStore.getState().pushToken || "";

  useEffect(() => {
    console.log("[CHAT] Widget ID:", widgetId);
    console.log("[CHAT] Metadata:", metadata);
    console.log("[CHAT] isAuthReady:", isAuthReady);
    console.log("[CHAT] isRegisterReady:", isRegisterReady);
    setIsReady(true);
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Debug info
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Widget: {widgetId}</Text>
          <Text style={styles.debugText}>
            User: {metadata.name || "Sem nome"}
          </Text>
        </View> */}

        <MenuIAChat
          widgetId={widgetId}
          inline={true}
          primaryColor="#32e10e"
          metadata={metadata}
          customFields={{
            cpf: isAuthReady ? authUser?.cpf || "" : registerData?.cpf || "",
            data_horario: dataFormatada,
            origem: "mobile",
            user_type: isAuthReady
              ? authUser?.type || "guest"
              : registerData?.type || "guest",
            is_authenticated: isAuthReady ? "true" : "false",
            auth_status: isAuthReady
              ? "logged"
              : isRegisterReady
                ? "registering"
                : "guest",
          }}
          expoPushToken={pushToken}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a14",
  },
  debugContainer: {
    backgroundColor: "#333",
    padding: 10,
  },
  debugText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default Chat;
