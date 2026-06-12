import type { PostHogEventProperties } from "@posthog/core";

export type ModalTrackingProperties = PostHogEventProperties & {
  flow?: string;
  modal_context?: string;
  modal_type?: string;
  screen?: string;
  source?: string;
};

export interface TrackModalEventParams {
  modalName: string;
  properties?: ModalTrackingProperties;
}

export interface UseModalTrackingParams extends TrackModalEventParams {
  isVisible: boolean;
}
