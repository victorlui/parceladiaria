import type { PostHogEventProperties } from "@posthog/core";

import api, { withAnalytics } from "./api";

export async function checkCPF(
  cpf: string,
  birthDate?: string,
  analyticsContext?: PostHogEventProperties,
): Promise<{ data: { type: string }; message: string; success: boolean }> {
  try {
    const response = await api.get(
      `/auth/info-cpf`,
      withAnalytics(analyticsContext ?? {}, {
        params: { cpf, birthdate: birthDate },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
