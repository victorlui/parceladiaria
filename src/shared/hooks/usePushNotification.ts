import Constants from "expo-constants";
import * as Notification from "expo-notifications";
import { useEffect } from "react";
import { useNotificationsStore } from "../store/useNotificationsStore";

let isFetchingToken = false;

export function usePushNotification() {
  const setPushToken = useNotificationsStore((state) => state.setPushToken);

  useEffect(() => {
    const checkAndRegister = async () => {
      if (useNotificationsStore.getState().pushToken || isFetchingToken) {
        return;
      }

      isFetchingToken = true;

      try {
        const token = (
          await Notification.getExpoPushTokenAsync({
            projectId:
              Constants.easConfig?.projectId ||
              Constants.expoConfig?.extra?.eas?.projectId,
          })
        ).data;
        console.log("token push:", token);
        setPushToken(token);
      } catch (error) {
        console.log("Erro ao pegar token:", error);
      } finally {
        isFetchingToken = false;
      }
    };

    checkAndRegister();
  }, [setPushToken]);
}
