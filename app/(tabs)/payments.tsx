import { AnalyticsService } from "@/analytics/analytics.service";
import { ANALYTICS_FLOWS, TAB_SCREENS } from "@/analytics/events";
import PaymentsScreen from "@/pages/payments/PaymentsScreen";
import { useFocusEffect } from "expo-router";
import React from "react";

const Payments = () => {
  useFocusEffect(
    React.useCallback(() => {
      AnalyticsService.screen(TAB_SCREENS.PAYMENTS, {
        flow: ANALYTICS_FLOWS.APP,
      });
    }, []),
  );

  return <PaymentsScreen />;
};

export default Payments;
