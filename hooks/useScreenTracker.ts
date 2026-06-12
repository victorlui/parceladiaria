import { usePathname } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect } from "react";

export function useScreenTracker() {
  const pathname = usePathname();
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture("$screen", {
      screen_name: pathname,
    });
    console.log("Tela registrada:", pathname);
  }, [pathname, posthog]);

  return null;
}
