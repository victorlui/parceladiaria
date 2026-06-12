import { useAuthStore } from "@/store/auth";
import type { PostHogEventProperties } from "@posthog/core";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { usePostHog } from "posthog-react-native";
import React, { PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

import { AnalyticsService } from "./analytics.service";
import { registerGlobalErrorHandler } from "./error-handler";
import { ANALYTICS_SOURCES } from "./events";

const ANALYTICS_DISTINCT_ID_KEY = "analytics_distinct_id";

function buildPlatformDistinctId(baseId: string) {
  const platformPrefix = `app-${Platform.OS}-`;

  if (baseId.startsWith(platformPrefix)) {
    return baseId;
  }

  return `${platformPrefix}${baseId}`;
}

async function getOrCreateAnalyticsDistinctId() {
  try {
    const storedDistinctId = await SecureStore.getItemAsync(
      ANALYTICS_DISTINCT_ID_KEY,
    );

    if (storedDistinctId) {
      return buildPlatformDistinctId(storedDistinctId);
    }

    const newDistinctId = buildPlatformDistinctId(Crypto.randomUUID());

    await SecureStore.setItemAsync(ANALYTICS_DISTINCT_ID_KEY, newDistinctId);

    return newDistinctId;
  } catch {
    return buildPlatformDistinctId(Crypto.randomUUID());
  }
}

function sanitizeAnalyticsProperties(properties: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as PostHogEventProperties;
}

function buildUserDistinctId(user?: {
  cpf?: string | null;
  id?: number | null;
}) {
  const normalizedCpf = String(user?.cpf ?? "").replace(/\D/g, "");

  if (normalizedCpf) {
    return `usuario-cpf-${normalizedCpf}`;
  }

  if (user?.id) {
    return `usuario-id-${user.id}`;
  }

  return null;
}

export function AnalyticsProvider({ children }: PropsWithChildren) {
  const posthog = usePostHog();
  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const hasRegisteredGlobalHandler = useRef(false);
  const hasIdentifiedInstallation = useRef(false);
  const installationDistinctId = useRef<string | null>(null);
  const lastIdentifiedUserId = useRef<string | null>(null);

  const getInstallationDistinctId = useCallback(async () => {
    if (installationDistinctId.current) {
      return installationDistinctId.current;
    }

    const distinctId = await getOrCreateAnalyticsDistinctId();
    installationDistinctId.current = distinctId;

    return distinctId;
  }, []);

  const identifyInstallation = useCallback(
    async (source: string) => {
      const distinctId = await getInstallationDistinctId();

      AnalyticsService.identify(
        distinctId,
        sanitizeAnalyticsProperties({
          platform: Platform.OS,
          app_open: source === ANALYTICS_SOURCES.APP_OPEN ? true : undefined,
          identification_source: source,
        }),
      );

      lastIdentifiedUserId.current = null;
      hasIdentifiedInstallation.current = true;
    },
    [getInstallationDistinctId],
  );

  useEffect(() => {
    AnalyticsService.setClient(posthog);
  }, [posthog]);

  useEffect(() => {
    if (hasIdentifiedInstallation.current) return;

    let isMounted = true;

    const identifyAppOpen = async () => {
      await posthog.ready();

      if (!isMounted || hasIdentifiedInstallation.current) return;

      await identifyInstallation(ANALYTICS_SOURCES.APP_OPEN);
    };

    identifyAppOpen();

    return () => {
      isMounted = false;
    };
  }, [identifyInstallation, posthog]);

  useEffect(() => {
    if (hasRegisteredGlobalHandler.current) return;

    registerGlobalErrorHandler();
    hasRegisteredGlobalHandler.current = true;
  }, []);

  useEffect(() => {
    if (!authToken || !authUser) {
      if (!lastIdentifiedUserId.current) {
        return;
      }

      let isMounted = true;

      const resetToInstallationIdentity = async () => {
        await posthog.ready();
        posthog.reset();

        if (!isMounted) return;

        await identifyInstallation(ANALYTICS_SOURCES.LOGOUT_RESET);
      };

      resetToInstallationIdentity();

      return () => {
        isMounted = false;
      };
    }

    let isMounted = true;

    const identifyAuthenticatedUser = async () => {
      await posthog.ready();

      if (!isMounted) return;

      const userDistinctId = buildUserDistinctId(authUser);

      if (!userDistinctId || lastIdentifiedUserId.current === userDistinctId) {
        return;
      }

      const currentDistinctId = posthog.getDistinctId();

      if (currentDistinctId && currentDistinctId !== userDistinctId) {
        posthog.reset();
      }

      if (!isMounted) {
        return;
      }

      AnalyticsService.identify(userDistinctId, {
        ...sanitizeAnalyticsProperties({
          platform: Platform.OS,
          identification_source: ANALYTICS_SOURCES.AUTHENTICATED_USER,
          user_id: authUser.id,
          cpf: authUser.cpf,
          email: authUser.email,
          nome: authUser.nome,
          tipo_usuario: authUser.type,
        }),
      });

      lastIdentifiedUserId.current = userDistinctId;
    };

    identifyAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, [
    authToken,
    authUser?.cpf,
    authUser?.email,
    authUser?.id,
    authUser?.nome,
    authUser?.type,
    identifyInstallation,
    posthog,
  ]);

  return <>{children}</>;
}
