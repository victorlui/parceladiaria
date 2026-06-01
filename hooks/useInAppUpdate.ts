import * as ExpoInAppUpdates from "expo-in-app-updates";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";

export function useForceInAppUpdate() {
  useEffect(() => {
    async function check() {
      if (__DEV__ || Platform.OS === "web") return;

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

  useEffect(() => {
    if (__DEV__ || Platform.OS === "web") return;

    const checkForUpdates = async () => {
      try {
        if (Platform.OS === "android") {
          const { updateAvailable, immediateAllowed, storeVersion } =
            await ExpoInAppUpdates.checkForUpdate();

          // 🚫 Se tem update e é permitido → BLOQUEIA
          if (updateAvailable && immediateAllowed) {
            await ExpoInAppUpdates.startUpdate(true); // true = IMMEDIATE
          }
        } else {
          const result = await ExpoInAppUpdates.checkForUpdate();

          if (!result.updateAvailable) return;

          Alert.alert(
            "Update available",
            "A new version of the app is available with many improvements and bug fixes. Would you like to update now?",
            [
              {
                text: "Update",
                isPreferred: true,
                onPress: async () => {
                  try {
                    await ExpoInAppUpdates.startUpdate();
                  } catch (err) {
                    console.error("Failed to start update:", err);
                  }
                },
              },
              { text: "Cancel" },
            ],
          );
        }
      } catch (err) {
        console.error("Update check failed:", err);
      }
    };

    checkForUpdates();
  }, []);
}
