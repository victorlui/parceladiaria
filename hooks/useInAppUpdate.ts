import * as ExpoInAppUpdates from "expo-in-app-updates";
import { useEffect } from "react";
import { Platform } from "react-native";

export function useForceInAppUpdate() {
  useEffect(() => {
    async function check() {
      if (Platform.OS !== "android" || __DEV__) return;

      try {
        const { updateAvailable, immediateAllowed, storeVersion } =
          await ExpoInAppUpdates.checkForUpdate();

        // 🚫 Se tem update e é permitido → BLOQUEIA
        if (updateAvailable && immediateAllowed) {
          await ExpoInAppUpdates.startUpdate(true); // true = IMMEDIATE
        }
      } catch (err) {
        return err;
      }
    }

    check();
  }, []);
}
