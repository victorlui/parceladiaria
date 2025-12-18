import * as Notification from "expo-notifications";
import * as Linking from "expo-linking";
import { Alert } from "react-native";
import Constants from "expo-constants";
import { useNotificationsStore } from "@/store/notifications";

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notification.getPermissionsAsync();
  const { setPushToken } = useNotificationsStore.getState();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notification.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "As notificações estão desativadas.",
      "Para receber alertas importantes, ative as notificações nas configurações do aplicativo.",
      [
        {
          text: "OK",
          onPress: () => Linking.openSettings(),
        },
        {
          text: "Cancelar",
          onPress: () => console.log("Cancel Pressed"),
        },
      ]
    );
    return;
  }

  const isDev = __DEV__;

  const token = (
    await Notification.getExpoPushTokenAsync(
      isDev
        ? undefined
        : {
            projectId:
              Constants.easConfig?.projectId ||
              Constants.expoConfig?.extra?.eas?.projectId,
          }
    )
  ).data;
  setPushToken(token);

  return token;
}
