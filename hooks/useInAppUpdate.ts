import * as ExpoInAppUpdates from "expo-in-app-updates";
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";

import { AnalyticsService } from "@/analytics/analytics.service";

// Global lock to prevent concurrent update operations
let updateInProgress = false;

export function useForceInAppUpdate() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Single initialization effect - no dependencies
  useEffect(() => {
    let cancelled = false;

    async function checkImmediateUpdate() {
      if (__DEV__ || Platform.OS === "web") return;
      if (cancelled) return;
      if (updateInProgress) return;

      try {
        AnalyticsService.track("Checking update", {
          source: "useForceInAppUpdate",
          platform: Platform.OS,
        });

        const { updateAvailable, immediateAllowed } =
          await ExpoInAppUpdates.checkForUpdate();

        if (cancelled || !isMountedRef.current) return;
        if (!updateAvailable || !immediateAllowed) return;
        if (updateInProgress) return;

        updateInProgress = true;

        try {
          AnalyticsService.track("Starting immediate update", {
            source: "useForceInAppUpdate",
            platform: Platform.OS,
          });

          await ExpoInAppUpdates.startUpdate(true); // true = IMMEDIATE
        } catch (error) {
          handleUpdateError(error);
        } finally {
          updateInProgress = false;
        }
      } catch (err) {
        // Silently handle errors during initial check
        return err;
      }
    }

    checkImmediateUpdate();
  }, []); // Empty dependency array - runs once on mount

  // Separate effect for flexible updates (Android)
  useEffect(() => {
    if (__DEV__ || Platform.OS === "web") return;
    if (Platform.OS !== "android") return;

    let cancelled = false;

    async function checkFlexibleUpdate() {
      if (cancelled) return;
      if (updateInProgress) return;

      try {
        const { updateAvailable, immediateAllowed } =
          await ExpoInAppUpdates.checkForUpdate();

        if (cancelled || !isMountedRef.current) return;
        if (!updateAvailable || !immediateAllowed) return;
        if (updateInProgress) return;

        updateInProgress = true;

        try {
          AnalyticsService.track("Starting flexible update", {
            source: "useForceInAppUpdate",
            platform: Platform.OS,
          });

          await ExpoInAppUpdates.startUpdate(true); // true = IMMEDIATE
        } catch (error) {
          handleUpdateError(error);
        } finally {
          updateInProgress = false;
        }
      } catch (err) {
        return err;
      }
    }

    checkFlexibleUpdate();
  }, []); // Empty dependency array - runs once on mount

  // Separate effect for flexible updates (iOS)
  useEffect(() => {
    if (__DEV__ || Platform.OS === "web") return;
    if (Platform.OS !== "ios") return;

    let cancelled = false;

    async function checkFlexibleUpdate() {
      if (cancelled) return;
      if (updateInProgress) return;

      try {
        const result = await ExpoInAppUpdates.checkForUpdate();

        if (cancelled || !isMountedRef.current) return;
        if (!result.updateAvailable) return;
        if (updateInProgress) return;

        updateInProgress = true;

        try {
          AnalyticsService.track("Update available", {
            source: "useForceInAppUpdate",
            platform: Platform.OS,
          });

          Alert.alert(
            "Update available",
            "A new version of the app is available with many improvements and bug fixes. Would you like to update now?",
            [
              {
                text: "Update",
                isPreferred: true,
                onPress: async () => {
                  if (updateInProgress) return;

                  try {
                    AnalyticsService.track("Starting update", {
                      source: "useForceInAppUpdate",
                      platform: Platform.OS,
                    });

                    await ExpoInAppUpdates.startUpdate();
                  } catch (err) {
                    handleUpdateError(err);
                  } finally {
                    updateInProgress = false;
                  }
                },
              },
              {
                text: "Cancel",
                onPress: () => {
                  updateInProgress = false;
                },
              },
            ],
          );
        } catch (error) {
          handleUpdateError(error);
          updateInProgress = false;
        }
      } catch (err) {
        return err;
      }
    }

    checkFlexibleUpdate();
  }, []); // Empty dependency array - runs once on mount
}

function handleUpdateError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);

  // Handle SendIntentException - do not crash, just log and exit
  if (
    message.includes("SendIntentException") ||
    message.includes("IntentSender") ||
    message.includes("zzf") ||
    message.includes("startIntentSenderForResult")
  ) {
    AnalyticsService.track("Update blocked by Play Store", {
      source: "useForceInAppUpdate",
      error_type: "SendIntentException",
    });
    return;
  }

  // Log other errors but don't crash
  console.error("Update error:", error);

  AnalyticsService.error(
    error instanceof Error ? error : new Error(String(error)),
    {
      source: "useForceInAppUpdate",
      error_type: "update_error",
    },
  );
}
