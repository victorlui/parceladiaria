import { usePathname } from "expo-router";
import { useEffect } from "react";

import { AnalyticsService } from "../analytics.service";

export function useScreenTracking() {
  const pathname = usePathname();

  useEffect(() => {
    AnalyticsService.screen(pathname);
  }, [pathname]);
}
