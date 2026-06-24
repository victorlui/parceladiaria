import Constants from "expo-constants";
import * as ExpoInAppUpdates from "expo-in-app-updates";
import { useEffect, useRef } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Linking,
  Platform,
} from "react-native";

import { AnalyticsService } from "@/analytics/analytics.service";

const SOURCE = "useForceInAppUpdate";
const STARTUP_SETTLE_MS = 8000;
const FOREGROUND_SETTLE_MS = 2000;
const CHECK_COOLDOWN_MS = 5 * 60 * 1000;

type UpdateTrigger = "startup" | "foreground" | "ios_confirm";

type InAppUpdateResult = {
  updateAvailable: boolean;
  flexibleAllowed?: boolean;
  immediateAllowed?: boolean;
  storeVersion?: string | number;
  daysSinceRelease?: number | null;
  serverPriority?: number | null;
  serverUpdateType?: string | null;
};

type LifecycleGuardResult = {
  isSafe: boolean;
  reason?: string;
  appState: AppStateStatus;
  sinceLaunchMs: number;
  sinceActiveMs: number | null;
};

const appLaunchAt = Date.now();
const coordinator = {
  checkPromise: null as Promise<void> | null,
  startPromise: null as Promise<boolean> | null,
  lastCheckAt: 0,
  lastActiveAt: AppState.currentState === "active" ? Date.now() : 0,
  iosPromptVisible: false,
};

const iosInfoPlist = Constants.expoConfig?.ios?.infoPlist as
  | Record<string, unknown>
  | undefined;
const iosAppStoreId =
  typeof iosInfoPlist?.AppStoreID === "string" ? iosInfoPlist.AppStoreID : null;
const iosAppStoreCountry =
  typeof iosInfoPlist?.AppStoreCountry === "string"
    ? iosInfoPlist.AppStoreCountry
    : "br";
const androidPackageName = Constants.expoConfig?.android?.package ?? null;

export function useForceInAppUpdate(options?: { disabled?: boolean }) {
  const disabled = options?.disabled ?? false;
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (__DEV__ || Platform.OS === "web" || disabled) {
      return;
    }

    let cancelled = false;

    const scheduleCheck = (trigger: UpdateTrigger, delayMs: number) => {
      if (cancelled || !isMountedRef.current) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (cancelled || !isMountedRef.current) {
          return;
        }

        void runUpdateCheck(trigger);
      }, delayMs);
    };

    if (AppState.currentState === "active") {
      coordinator.lastActiveAt = Date.now();
    }

    scheduleCheck("startup", STARTUP_SETTLE_MS);

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState !== "active") {
        return;
      }

      coordinator.lastActiveAt = Date.now();
      scheduleCheck("foreground", FOREGROUND_SETTLE_MS);
    });

    return () => {
      cancelled = true;
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [disabled]);
}

async function runUpdateCheck(trigger: UpdateTrigger): Promise<void> {
  if (coordinator.checkPromise) {
    return coordinator.checkPromise;
  }

  const lifecycle = getLifecycleGuard();
  if (!lifecycle.isSafe) {
    logUpdateEvent("UPDATE_ACTIVITY_INVALID", {
      trigger,
      stage: "check",
      reason: lifecycle.reason,
      sinceLaunchMs: lifecycle.sinceLaunchMs,
      sinceActiveMs: lifecycle.sinceActiveMs,
    });
    return;
  }

  const now = Date.now();
  if (now - coordinator.lastCheckAt < CHECK_COOLDOWN_MS) {
    return;
  }

  coordinator.checkPromise = (async () => {
    coordinator.lastCheckAt = Date.now();

    logUpdateEvent("UPDATE_CHECK_STARTED", {
      trigger,
      sinceLaunchMs: lifecycle.sinceLaunchMs,
      sinceActiveMs: lifecycle.sinceActiveMs,
    });

    try {
      const result =
        (await ExpoInAppUpdates.checkForUpdate()) as InAppUpdateResult;

      if (!result.updateAvailable) {
        logUpdateEvent("UPDATE_NOT_AVAILABLE", { trigger });
        return;
      }

      logUpdateEvent("UPDATE_AVAILABLE", {
        trigger,
        storeVersion: result.storeVersion,
        immediateAllowed: result.immediateAllowed ?? null,
        flexibleAllowed: result.flexibleAllowed ?? null,
        daysSinceRelease: result.daysSinceRelease ?? null,
        serverPriority: result.serverPriority ?? null,
        serverUpdateType: result.serverUpdateType ?? null,
      });

      if (Platform.OS === "android") {
        if (!result.immediateAllowed && !result.flexibleAllowed) {
          logUpdateEvent("UPDATE_INSTALL_FAILED", {
            trigger,
            reason: "no_allowed_update_type",
            storeVersion: result.storeVersion,
          });
          return;
        }

        await startNativeUpdate(trigger, result);
        return;
      }

      showIosUpdatePrompt(trigger, result);
    } catch (error) {
      captureUpdateError("check_for_update", error, { trigger });
    } finally {
      coordinator.checkPromise = null;
    }
  })();

  return coordinator.checkPromise;
}

function showIosUpdatePrompt(
  trigger: UpdateTrigger,
  result: InAppUpdateResult,
) {
  if (coordinator.iosPromptVisible) {
    return;
  }

  const lifecycle = getLifecycleGuard();
  if (!lifecycle.isSafe) {
    logUpdateEvent("UPDATE_ACTIVITY_INVALID", {
      trigger,
      stage: "ios_prompt",
      reason: lifecycle.reason,
      sinceLaunchMs: lifecycle.sinceLaunchMs,
      sinceActiveMs: lifecycle.sinceActiveMs,
    });
    return;
  }

  coordinator.iosPromptVisible = true;

  Alert.alert(
    "Atualização disponível",
    "Uma nova versão do aplicativo está disponível com melhorias importantes. Deseja atualizar agora?",
    [
      {
        text: "Atualizar",
        isPreferred: true,
        onPress: () => {
          coordinator.iosPromptVisible = false;
          void startNativeUpdate("ios_confirm", result);
        },
      },
      {
        text: "Agora não",
        style: "cancel",
        onPress: () => {
          coordinator.iosPromptVisible = false;
        },
      },
    ],
    {
      cancelable: false,
      onDismiss: () => {
        coordinator.iosPromptVisible = false;
      },
    },
  );
}

async function startNativeUpdate(
  trigger: UpdateTrigger,
  result: InAppUpdateResult,
): Promise<boolean> {
  if (coordinator.startPromise) {
    return coordinator.startPromise;
  }

  const lifecycle = getLifecycleGuard();
  if (!lifecycle.isSafe) {
    logUpdateEvent("UPDATE_ACTIVITY_INVALID", {
      trigger,
      stage: "start_update",
      reason: lifecycle.reason,
      sinceLaunchMs: lifecycle.sinceLaunchMs,
      sinceActiveMs: lifecycle.sinceActiveMs,
    });
    return false;
  }

  coordinator.startPromise = (async () => {
    try {
      logUpdateEvent("UPDATE_DOWNLOAD_STARTED", {
        trigger,
        storeVersion: result.storeVersion,
        serverUpdateType: result.serverUpdateType ?? null,
      });

      logUpdateEvent("UPDATE_INSTALL_STARTED", {
        trigger,
        storeVersion: result.storeVersion,
        immediateAllowed: result.immediateAllowed ?? null,
        flexibleAllowed: result.flexibleAllowed ?? null,
      });

      const started = await ExpoInAppUpdates.startUpdate();

      if (!started) {
        logUpdateEvent("UPDATE_INSTALL_FAILED", {
          trigger,
          reason: "start_update_returned_false",
          storeVersion: result.storeVersion,
        });
        return await openStoreFallback(trigger, "start_update_returned_false");
      }

      logUpdateEvent("UPDATE_DOWNLOAD_FINISHED", {
        trigger,
        storeVersion: result.storeVersion,
        handoff: "native_flow_started",
      });

      return true;
    } catch (error) {
      const message = getErrorMessage(error);

      if (isActivityIntentError(message)) {
        logUpdateEvent("UPDATE_ACTIVITY_INVALID", {
          trigger,
          stage: "start_update",
          reason: "native_activity_not_ready",
          storeVersion: result.storeVersion,
        });
      }

      captureUpdateError("start_update", error, {
        trigger,
        storeVersion: result.storeVersion,
      });

      return await openStoreFallback(trigger, "start_update_exception");
    } finally {
      coordinator.startPromise = null;
    }
  })();

  return coordinator.startPromise;
}

function getLifecycleGuard(): LifecycleGuardResult {
  const now = Date.now();
  const appState = AppState.currentState;
  const sinceLaunchMs = now - appLaunchAt;
  const sinceActiveMs = coordinator.lastActiveAt
    ? now - coordinator.lastActiveAt
    : null;

  if (appState !== "active") {
    return {
      isSafe: false,
      reason: "app_not_active",
      appState,
      sinceLaunchMs,
      sinceActiveMs,
    };
  }

  if (sinceLaunchMs < STARTUP_SETTLE_MS) {
    return {
      isSafe: false,
      reason: "startup_not_settled",
      appState,
      sinceLaunchMs,
      sinceActiveMs,
    };
  }

  if (sinceActiveMs !== null && sinceActiveMs < FOREGROUND_SETTLE_MS) {
    return {
      isSafe: false,
      reason: "foreground_transition_not_settled",
      appState,
      sinceLaunchMs,
      sinceActiveMs,
    };
  }

  return {
    isSafe: true,
    appState,
    sinceLaunchMs,
    sinceActiveMs,
  };
}

async function openStoreFallback(
  trigger: UpdateTrigger,
  reason: string,
): Promise<boolean> {
  if (AppState.currentState !== "active") {
    logUpdateEvent("UPDATE_ACTIVITY_INVALID", {
      trigger,
      stage: "open_store_fallback",
      reason: "app_not_active",
    });
    return false;
  }

  const url = getStoreFallbackUrl();
  if (!url) {
    logUpdateEvent("UPDATE_INSTALL_FAILED", {
      trigger,
      reason,
      fallback: "store_url_missing",
    });
    return false;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
  } catch (error) {
    captureUpdateError("open_store_fallback", error, { trigger, reason, url });
  }

  const webUrl = getStoreFallbackWebUrl();
  if (!webUrl) {
    logUpdateEvent("UPDATE_INSTALL_FAILED", {
      trigger,
      reason,
      fallback: "web_store_url_missing",
    });
    return false;
  }

  try {
    await Linking.openURL(webUrl);
    return true;
  } catch (error) {
    captureUpdateError("open_store_web_fallback", error, {
      trigger,
      reason,
      url: webUrl,
    });
    return false;
  }
}

function getStoreFallbackUrl(): string | null {
  if (Platform.OS === "android" && androidPackageName) {
    return `market://details?id=${androidPackageName}`;
  }

  if (Platform.OS === "ios" && iosAppStoreId) {
    return `itms-apps://itunes.apple.com/${iosAppStoreCountry}/app/id${iosAppStoreId}`;
  }

  return null;
}

function getStoreFallbackWebUrl(): string | null {
  if (Platform.OS === "android" && androidPackageName) {
    return `https://play.google.com/store/apps/details?id=${androidPackageName}`;
  }

  if (Platform.OS === "ios" && iosAppStoreId) {
    return `https://apps.apple.com/${iosAppStoreCountry}/app/id${iosAppStoreId}`;
  }

  return null;
}

function captureUpdateError(
  stage: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  console.error(`[UPDATE] ${stage}`, error);

  logUpdateEvent("UPDATE_INSTALL_FAILED", {
    stage,
    errorMessage: normalizedError.message,
    errorName: normalizedError.name,
    ...extra,
  });

  AnalyticsService.error(normalizedError, {
    source: SOURCE,
    platform: Platform.OS,
    stage,
    ...extra,
  });
}

function logUpdateEvent(event: string, properties?: Record<string, unknown>) {
  const payload = {
    source: SOURCE,
    platform: Platform.OS,
    appState: AppState.currentState,
    ...properties,
  };

  console.info(`[UPDATE] ${event}`, payload);
  AnalyticsService.track(event, payload);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isActivityIntentError(message: string): boolean {
  return (
    message.includes("SendIntentException") ||
    message.includes("IntentSender") ||
    message.includes("zzf") ||
    message.includes("startIntentSenderForResult")
  );
}
