import { AnalyticsService } from "@/analytics/analytics.service";
import { ANALYTICS_FLOWS, TAB_SCREENS } from "@/analytics/events";
import HomeScreen from "@/pages/home/HomeScreen";
import { useFocusEffect } from "expo-router";
import React from "react";

const Home: React.FC = () => {
  useFocusEffect(
    React.useCallback(() => {
      AnalyticsService.screen(TAB_SCREENS.HOME, {
        flow: ANALYTICS_FLOWS.APP,
      });
    }, []),
  );

  return <HomeScreen />;
};

export default Home;
