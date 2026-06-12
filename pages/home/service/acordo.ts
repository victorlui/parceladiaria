import type { PostHogEventProperties } from "@posthog/core";

import api, { withAnalytics } from "@/services/api";

export async function getAcordo(analyticsContext?: PostHogEventProperties) {
  try {
    const { data } = await api.get(
      "/v1/agreement",
      analyticsContext ? withAnalytics(analyticsContext) : undefined,
    );
    return data;
  } catch (error) {
    throw error;
  }
}
