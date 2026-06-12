import type { PostHogEventProperties } from "@posthog/core";
import type { PostHog } from "posthog-react-native";

export class AnalyticsService {
  private static client: PostHog | null = null;

  static setClient(posthog: PostHog) {
    AnalyticsService.client = posthog;
  }

  static identify(userId: string, properties?: PostHogEventProperties) {
    AnalyticsService.client?.identify(userId, properties);
  }

  static track(event: string, properties?: PostHogEventProperties) {
    AnalyticsService.client?.capture(event, properties);
  }

  static screen(screenName: string, properties?: PostHogEventProperties) {
    AnalyticsService.client?.screen(screenName, properties);
  }

  static error(error: Error, context?: PostHogEventProperties) {
    AnalyticsService.client?.captureException(error, context);
  }
}
