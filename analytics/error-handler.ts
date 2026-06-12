import type { PostHogEventProperties } from "@posthog/core";

import { AnalyticsService } from "./analytics.service";
import { ANALYTICS_SOURCES, EVENTS } from "./events";

function sanitizeProperties(
  properties: Record<string, unknown>,
): PostHogEventProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as PostHogEventProperties;
}

function normalizeError(error: unknown, fallbackMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }

  const errorMessage =
    typeof error === "string"
      ? error
      : typeof (error as any)?.message === "string"
        ? (error as any).message
        : fallbackMessage;

  const normalizedError = new Error(errorMessage);

  if (typeof (error as any)?.name === "string") {
    normalizedError.name = (error as any).name;
  }

  if (typeof (error as any)?.stack === "string") {
    normalizedError.stack = (error as any).stack;
  }

  return normalizedError;
}

function getErrorProperties(error: unknown): PostHogEventProperties {
  const normalizedError = normalizeError(error, "Erro inesperado");

  return sanitizeProperties({
    error_name: normalizedError.name,
    error_message: normalizedError.message,
    error_code:
      typeof (error as any)?.code === "string" ||
      typeof (error as any)?.code === "number"
        ? String((error as any).code)
        : undefined,
    error_status:
      typeof (error as any)?.status === "number"
        ? (error as any).status
        : (error as any)?.response?.status,
    error_response_message:
      typeof (error as any)?.response?.data?.message === "string"
        ? (error as any).response.data.message
        : undefined,
  });
}

export function trackApiError(
  error: unknown,
  context: PostHogEventProperties = {},
) {
  const normalizedError = normalizeError(error, "Erro de API");
  const properties = sanitizeProperties({
    ...getErrorProperties(error),
    ...context,
    error_type: "api",
  });

  AnalyticsService.track(EVENTS.API_ERROR, properties);
  AnalyticsService.error(normalizedError, properties);
}

export function trackAppError(
  error: unknown,
  context: PostHogEventProperties = {},
) {
  const normalizedError = normalizeError(error, "Erro da aplicacao");
  const properties = sanitizeProperties({
    ...getErrorProperties(error),
    ...context,
    error_type: "app",
  });

  AnalyticsService.track(EVENTS.APP_ERROR, properties);
  AnalyticsService.error(normalizedError, properties);
}

export function trackAlertShown(context: PostHogEventProperties = {}) {
  const properties = sanitizeProperties({
    ...context,
  });

  AnalyticsService.track(EVENTS.ALERT_SHOWN, properties);
}

export function trackApiAlertShown(
  alertType: string,
  alertTitle: string,
  alertMessage: string,
  context: PostHogEventProperties = {},
) {
  trackAlertShown({
    source: ANALYTICS_SOURCES.API_INTERCEPTOR_ALERT,
    alert_type: alertType,
    alert_title: alertTitle,
    alert_message: alertMessage,
    ...context,
  });
}

export function registerGlobalErrorHandler() {
  const defaultHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal: any) => {
    trackAppError(error, {
      isFatal,
      source: ANALYTICS_SOURCES.GLOBAL_ERROR_HANDLER,
    });

    defaultHandler(error, isFatal);
  });
}
