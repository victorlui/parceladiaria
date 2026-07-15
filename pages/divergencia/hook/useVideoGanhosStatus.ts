import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getVideoGanhosStatus } from "../service/videoGanhos";

type UseVideoGanhosStatusParams = {
  enabled: boolean;
  timeoutMs?: number;
  pollingIntervalMs?: number;
};

export function useVideoGanhosStatus({
  enabled,
  timeoutMs = 90_000,
  pollingIntervalMs = 4_000,
}: UseVideoGanhosStatusParams) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!enabled) {
      setStartedAt(null);
      return;
    }

    setStartedAt((current) => current ?? Date.now());
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !startedAt) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, startedAt]);

  const elapsedMs = useMemo(() => {
    if (!startedAt) return 0;
    return Math.max(0, now - startedAt);
  }, [now, startedAt]);

  const query = useQuery({
    queryKey: ["divergencia", "video-ganhos", "status"],
    queryFn: getVideoGanhosStatus,
    enabled,
    retry: false,
    staleTime: 0,
    refetchInterval: (queryState) => {
      if (!enabled || !startedAt) return false;

      const status = queryState.state.data;
      const isCompleted = status?.estado === "concluido";
      const isTimedOut =
        elapsedMs >= timeoutMs && status?.estado !== "concluido";

      if (isCompleted || isTimedOut) {
        return false;
      }

      return pollingIntervalMs;
    },
  });

  const isCompleted = query.data?.estado === "concluido";
  const hasTimedOut =
    enabled &&
    Boolean(startedAt) &&
    elapsedMs >= timeoutMs &&
    !isCompleted &&
    query.data?.feature_ativa !== false;

  return {
    ...query,
    elapsedMs,
    hasTimedOut,
    isCompleted,
  };
}
