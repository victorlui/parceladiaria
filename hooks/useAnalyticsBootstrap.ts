import analytics from "@react-native-firebase/analytics";
import { useEffect } from "react";

export function AnalyticsBootstrap() {
  useEffect(() => {
    analytics().logEvent("app_opened");
  }, []);

  return null;
}
