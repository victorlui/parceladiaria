import { AnalyticsService } from "../analytics.service";
import { trackModalClosed, trackModalOpened } from "../modal-tracking";

export function useAnalytics() {
  return {
    track: AnalyticsService.track,
    identify: AnalyticsService.identify,
    screen: AnalyticsService.screen,
    error: AnalyticsService.error,
    trackModalOpened,
    trackModalClosed,
  };
}
