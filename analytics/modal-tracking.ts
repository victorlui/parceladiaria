import type { PostHogEventProperties } from "@posthog/core";

import { AnalyticsService } from "./analytics.service";
import type { ModalTrackingProperties, TrackModalEventParams } from "./analytics.types";
import { ANALYTICS_SOURCES, EVENTS } from "./events";

function buildModalEventProperties(
  modalName: string,
  properties?: ModalTrackingProperties,
): PostHogEventProperties {
  const { source = ANALYTICS_SOURCES.MODAL_TRACKING, ...restProperties } =
    properties ?? {};

  return {
    source,
    modal_name: modalName,
    ...restProperties,
  };
}

export function trackModalOpened({
  modalName,
  properties,
}: TrackModalEventParams) {
  AnalyticsService.track(
    EVENTS.MODAL_OPENED,
    buildModalEventProperties(modalName, properties),
  );
}

export function trackModalClosed({
  modalName,
  properties,
}: TrackModalEventParams) {
  AnalyticsService.track(
    EVENTS.MODAL_CLOSED,
    buildModalEventProperties(modalName, properties),
  );
}
