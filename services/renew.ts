import type { PostHogEventProperties } from "@posthog/core";

import { api } from "@/services/api";

export async function renewStatus(analyticsContext?: PostHogEventProperties) {
  try {
    const response = await api.get(
      "v1/renew/rules",
      analyticsContext ? withAnalytics(analyticsContext) : undefined,
    );
    return response;
  } catch (error: any) {
    throw error;
  }
}

export type PropsListRenew = {
  debt: number;
  discount_iof: string;
  discount_tic: string;
  id: number;
  installments: number;
  loan_value: string;
  paidAmount: number;
  qtyPaid: number;
  qtyUnpaid: number;
  tax: string;
  tax_iof: string;
  tax_tic: string;
  to_receive: string;
  unpaidAmount: number;
};

export async function renewList(
  analyticsContext?: PostHogEventProperties,
): Promise<PropsListRenew[]> {
  try {
    const response = await api.get(
      "/v1/renew",
      analyticsContext ? withAnalytics(analyticsContext) : undefined,
    );

    return response.data.data;
  } catch (error) {
    throw error;
  }
}
