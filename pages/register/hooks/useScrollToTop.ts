import { useCallback, useEffect, useRef } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useScrollToTopStore } from "../store/scrollToTopStore";

type ScrollToTopConfig = {
  showAfterY?: number;
  hideBelowY?: number;
};

type ScrollToMethods = {
  scrollTo?: (params: { x?: number; y?: number; animated?: boolean }) => void;
  scrollToOffset?: (params: { offset: number; animated?: boolean }) => void;
};

export function useScrollToTop(
  scrollRef: React.RefObject<unknown>,
  config: ScrollToTopConfig = {},
) {
  const show = useScrollToTopStore((s) => s.show);
  const hide = useScrollToTopStore((s) => s.hide);

  const showAfterY = config.showAfterY ?? 300;
  const hideBelowY = config.hideBelowY ?? 20;

  const lastVisible = useRef(false);

  useEffect(() => {
    lastVisible.current = false;
    hide();
  }, [hide]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const shouldShow = y > showAfterY;
      const shouldHide = y <= hideBelowY;

      if (shouldShow && !lastVisible.current) {
        lastVisible.current = true;
        show();
        return;
      }

      if (shouldHide && lastVisible.current) {
        lastVisible.current = false;
        hide();
      }
    },
    [hide, hideBelowY, show, showAfterY],
  );

  const scrollToTop = useCallback(() => {
    const current = scrollRef.current;
    if (!current) return;

    const methods = current as ScrollToMethods;

    if (typeof methods.scrollTo === "function") {
      methods.scrollTo({ y: 0, animated: true });
      return;
    }

    if (typeof methods.scrollToOffset === "function") {
      methods.scrollToOffset({ offset: 0, animated: true });
    }
  }, [scrollRef]);

  return { onScroll, scrollToTop };
}
