import { useEffect, useRef } from "react";

import type { ModalTrackingProperties, UseModalTrackingParams } from "../analytics.types";
import { trackModalClosed, trackModalOpened } from "../modal-tracking";

export function useModalTracking({
  isVisible,
  modalName,
  properties,
}: UseModalTrackingParams) {
  const lastVisibleRef = useRef(false);
  const latestPayloadRef = useRef<{
    modalName: string;
    properties?: ModalTrackingProperties;
  }>({
    modalName,
    properties,
  });

  useEffect(() => {
    latestPayloadRef.current = {
      modalName,
      properties,
    };
  }, [modalName, properties]);

  useEffect(() => {
    if (isVisible && !lastVisibleRef.current) {
      trackModalOpened({ modalName, properties });
    }

    if (!isVisible && lastVisibleRef.current) {
      trackModalClosed({ modalName, properties });
    }

    lastVisibleRef.current = isVisible;
  }, [isVisible, modalName, properties]);

  useEffect(() => {
    return () => {
      if (!lastVisibleRef.current) {
        return;
      }

      trackModalClosed(latestPayloadRef.current);
    };
  }, []);
}
