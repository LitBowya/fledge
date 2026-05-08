import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getRegistrations } from "#/server/register";
import type { AnalyticsSnapshot, RegistrationRecord } from "#/sections/analytics/types";
import { buildAnalyticsSnapshot } from "#/sections/analytics/utils/analytics";

const EMPTY_ANALYTICS: AnalyticsSnapshot = buildAnalyticsSnapshot([]);

export function useRegistrationAnalytics() {
  const query = useQuery({
    queryKey: ["registrations"],
    queryFn: () => getRegistrations(),
  });

  const registrations = (query.data ?? []) as RegistrationRecord[];

  const analytics = useMemo(
    () => (registrations.length ? buildAnalyticsSnapshot(registrations) : EMPTY_ANALYTICS),
    [registrations],
  );

  return {
    ...query,
    registrations,
    analytics,
  };
}
