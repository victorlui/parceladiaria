import { useEffect } from "react";
import { Platform } from "react-native";
import * as ExpoInAppUpdates from "expo-in-app-updates";

export function useForceInAppUpdate() {
  useEffect(() => {
    async function check() {
      if (Platform.OS !== "android" || __DEV__) return;

      try {
        const { updateAvailable, immediateAllowed, storeVersion } =
          await ExpoInAppUpdates.checkForUpdate();

        console.log("FORCE UPDATE", {
          updateAvailable,
          immediateAllowed,
          storeVersion,
        });

        // 🚫 Se tem update e é permitido → BLOQUEIA
        if (updateAvailable && immediateAllowed) {
          await ExpoInAppUpdates.startUpdate(true); // true = IMMEDIATE
        }
      } catch (err) {
        console.log("Force update error:", err);
      }
    }

    check();
  }, []);
}
