import type {
  AnalyticsSnapshot,
  DenominationGroup,
  DuplicateName,
  GroupMetric,
  RegistrationRecord,
  Recommendation,
  SuspiciousEntry,
  TrendPoint,
} from "#/sections/analytics/types";
import {
  normalizeDenominationSeed,
  normalizeLocation,
  normalizeReferralSource,
  normalizeToken,
  normalizeWhitespace,
  resolveDenominationGroup,
} from "#/sections/analytics/utils/normalization";

function percent(part: number, whole: number): number {
  if (!whole) return 0;
  return (part / whole) * 100;
}

function toDateSafe(value: RegistrationRecord["createdAt"]): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toMetricGroupRecord(map: Map<string, number>, total: number): GroupMetric[] {
  return [...map.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage: percent(count, total),
    }))
    .sort((a, b) => b.count - a.count);
}

function buildDenominationGroups(
  registrations: RegistrationRecord[],
): DenominationGroup[] {
  const groups = new Map<
    string,
    {
      count: number;
      variants: Set<string>;
    }
  >();

  for (const row of registrations) {
    const existing = [...groups.keys()];
    const resolved = resolveDenominationGroup(row.denomination, existing);
    const entry = groups.get(resolved) ?? {
      count: 0,
      variants: new Set<string>(),
    };
    entry.count += 1;
    entry.variants.add(normalizeWhitespace(row.denomination) || "Unknown");
    groups.set(resolved, entry);
  }

  const total = registrations.length;
  return [...groups.entries()]
    .map(([name, data]) => ({
      name,
      normalizedName: name,
      count: data.count,
      percentage: percent(data.count, total),
      variants: [...data.variants].sort(),
    }))
    .sort((a, b) => b.count - a.count);
}

function buildTrends(registrations: RegistrationRecord[]): TrendPoint[] {
  const dayMap = new Map<string, number>();

  for (const row of registrations) {
    const date = toDateSafe(row.createdAt);
    if (!date) continue;
    const day = date.toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  const sorted = [...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  let cumulative = 0;

  return sorted.map(([date, registrationsCount]) => {
    cumulative += registrationsCount;
    return {
      date,
      registrations: registrationsCount,
      cumulative,
    };
  });
}

function buildRecentRegistrations(registrations: RegistrationRecord[]): RegistrationRecord[] {
  return [...registrations]
    .sort((a, b) => {
      const aDate = toDateSafe(a.createdAt)?.getTime() ?? 0;
      const bDate = toDateSafe(b.createdAt)?.getTime() ?? 0;
      return bDate - aDate;
    })
    .slice(0, 8);
}

function buildDuplicateNames(registrations: RegistrationRecord[]): DuplicateName[] {
  const map = new Map<string, { count: number; display: string }>();
  for (const row of registrations) {
    const normalized = normalizeToken(row.name);
    if (!normalized) continue;
    const entry = map.get(normalized) ?? { count: 0, display: row.name };
    entry.count += 1;
    map.set(normalized, entry);
  }

  return [...map.values()]
    .filter((entry) => entry.count > 1)
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({
      name: entry.display,
      count: entry.count,
    }));
}

function buildSuspiciousEntries(registrations: RegistrationRecord[]): SuspiciousEntry[] {
  const suspicious: SuspiciousEntry[] = [];

  for (const row of registrations) {
    const nameToken = normalizeToken(row.name);
    const contactDigits = row.contact.replace(/\D/g, "");
    const denominationSeed = normalizeDenominationSeed(row.denomination);

    if (nameToken.length < 2) {
      suspicious.push({ id: row.id, name: row.name, reason: "Very short name" });
      continue;
    }

    if (/\btest|demo|sample|unknown|n\/a\b/.test(nameToken)) {
      suspicious.push({ id: row.id, name: row.name, reason: "Placeholder-like name" });
      continue;
    }

    if (contactDigits.length < 7) {
      suspicious.push({ id: row.id, name: row.name, reason: "Invalid contact format" });
      continue;
    }

    if (!denominationSeed || denominationSeed === "unknown") {
      suspicious.push({ id: row.id, name: row.name, reason: "Missing denomination" });
    }
  }

  return suspicious.slice(0, 15);
}

function buildRecommendations(input: {
  transportPct: number;
  duplicateNames: number;
  suspiciousEntries: number;
  topReferral: GroupMetric | null;
  unknownLocationCount: number;
  unknownDenominationCount: number;
  total: number;
}): Recommendation[] {
  const recommendations: Recommendation[] = [
    {
      title: "Build segmented follow-up workflows",
      description:
        "Create communication segments for transport users, high-interest denominations, and recent registrations to improve turnout reliability.",
      priority: "medium",
      aiAdded: true,
    },
    {
      title: "Plan location-based mobilization clusters",
      description:
        "Group volunteers by top attendee locations to coordinate reminders and travel support closer to event day.",
      priority: "medium",
      aiAdded: true,
    },
  ];

  if (input.transportPct >= 35) {
    recommendations.unshift({
      title: "Scale transportation logistics",
      description:
        "Transport demand is high. Reserve extra bus capacity and prioritize pickup communication for top demand areas.",
      priority: "high",
      aiAdded: true,
    });
  }

  if (input.topReferral) {
    recommendations.push({
      title: `Double down on ${input.topReferral.name}`,
      description:
        "Top-performing referral channel is driving registrations. Prioritize content and outreach budget there.",
      priority: "medium",
      aiAdded: true,
    });
  }

  if (input.duplicateNames > 0 || input.suspiciousEntries > 0) {
    recommendations.push({
      title: "Strengthen registration validation",
      description:
        "Detected duplicate/suspicious records. Add anti-duplicate checks and stricter contact validation to improve data quality.",
      priority: "high",
      aiAdded: true,
    });
  }

  const unknownDataPct = percent(
    input.unknownLocationCount + input.unknownDenominationCount,
    input.total * 2,
  );
  if (unknownDataPct > 8) {
    recommendations.push({
      title: "Reduce unknown demographic fields",
      description:
        "A meaningful share of location/denomination entries is ambiguous. Improve form hints and controlled options where possible.",
      priority: "medium",
      aiAdded: true,
    });
  }

  return recommendations;
}

export function buildAnalyticsSnapshot(
  registrations: RegistrationRecord[],
): AnalyticsSnapshot {
  const total = registrations.length;
  const males = registrations.filter((row) => normalizeToken(row.sex).startsWith("m")).length;
  const females = registrations.filter((row) => normalizeToken(row.sex).startsWith("f")).length;
  const busRequests = registrations.filter((row) => row.wantsBusReturnTrip).length;

  const denominationGroups = buildDenominationGroups(registrations);
  const referralMap = new Map<string, number>();
  const locationMap = new Map<string, number>();
  const genderMap = new Map<string, number>([
    ["Male", males],
    ["Female", females],
    ["Other", Math.max(total - males - females, 0)],
  ]);
  const transportMap = new Map<string, number>([
    ["Requested", busRequests],
    ["No Request", Math.max(total - busRequests, 0)],
  ]);

  for (const row of registrations) {
    const referral = normalizeReferralSource(row.referralSource);
    referralMap.set(referral, (referralMap.get(referral) ?? 0) + 1);

    const location = normalizeLocation(row.location);
    locationMap.set(location, (locationMap.get(location) ?? 0) + 1);
  }

  const referralSources = toMetricGroupRecord(referralMap, total);
  const topLocations = toMetricGroupRecord(locationMap, total).slice(0, 8);
  const locationMaxCount = topLocations[0]?.count ?? 1;

  const locationHeatmap = toMetricGroupRecord(locationMap, total)
    .slice(0, 18)
    .map((item) => {
      const intensity = Math.round((item.count / locationMaxCount) * 100);
      return {
        location: item.name,
        count: item.count,
        percentage: item.percentage,
        intensity,
        level: intensity >= 70 ? "high" : intensity >= 40 ? "medium" : "low",
      } as const;
    });

  const busUsers = registrations.filter((row) => row.wantsBusReturnTrip);
  const busLocationMap = new Map<string, number>();
  const busDenominationMap = new Map<string, number>();
  for (const row of busUsers) {
    const location = normalizeLocation(row.location);
    busLocationMap.set(location, (busLocationMap.get(location) ?? 0) + 1);

    const denom = resolveDenominationGroup(
      row.denomination,
      [...busDenominationMap.keys()],
    );
    busDenominationMap.set(denom, (busDenominationMap.get(denom) ?? 0) + 1);
  }

  const contactAvailable = registrations.filter((row) => normalizeWhitespace(row.contact).length > 0).length;
  const validContactFormat = registrations.filter((row) => {
    const digits = row.contact.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }).length;

  const duplicateNames = buildDuplicateNames(registrations);
  const suspiciousEntries = buildSuspiciousEntries(registrations);
  const denominationInconsistencies = denominationGroups
    .filter((group) => group.variants.length > 1)
    .map((group) => ({
      normalizedName: group.normalizedName,
      variants: group.variants,
      count: group.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const unknownLocationCount = registrations.filter(
    (row) => normalizeLocation(row.location) === "Unknown",
  ).length;
  const unknownDenominationCount = registrations.filter(
    (row) => resolveDenominationGroup(row.denomination, []) === "Unknown",
  ).length;

  const qualityPenalty = Math.min(
    100,
    duplicateNames.length * 6 +
      suspiciousEntries.length * 3 +
      denominationInconsistencies.length * 2,
  );
  const dataQualityScore = Math.max(0, 100 - qualityPenalty);

  const topReferralSource = referralSources[0] ?? null;

  return {
    core: {
      totalRegistered: total,
      totalMales: males,
      totalFemales: females,
      totalBusRequests: busRequests,
      genderSplit: {
        malePct: percent(males, total),
        femalePct: percent(females, total),
      },
      transportRequestPct: percent(busRequests, total),
      totalUniqueDenominations: denominationGroups.length,
      totalUniqueLocations: locationMap.size,
      totalReferralEntries: referralSources.length,
    },
    chartSeries: {
      genderDistribution: toMetricGroupRecord(genderMap, total),
      transportDistribution: toMetricGroupRecord(transportMap, total),
      denominationGroups: denominationGroups.slice(0, 12),
      referralSources,
      trend: buildTrends(registrations),
      topLocations,
    },
    additionalAnalytics: {
      locationHeatmap,
      firstTimeVsReturning: {
        firstTime: { count: 0, percentage: 0 },
        returning: { count: 0, percentage: 0 },
        unknown: { count: total, percentage: percent(total, total) },
        architectureNote:
          "Future-ready: add `isReturning` boolean and optional `attendedBeforeCount` fields to registration schema for lifecycle analytics.",
      },
      busDemandInsights: {
        demandPercentage: percent(busUsers.length, total),
        topBusDemandLocation: [...busLocationMap.entries()].sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0] ?? "N/A",
        topBusDemandDenomination: [...busDenominationMap.entries()].sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0] ?? "N/A",
      },
      mostEngagedDenominationGroups: denominationGroups.slice(0, 5),
      contactCompleteness: {
        withContact: {
          count: contactAvailable,
          percentage: percent(contactAvailable, total),
        },
        validContactFormat: {
          count: validContactFormat,
          percentage: percent(validContactFormat, total),
        },
      },
    },
    dataQuality: {
      duplicateNames,
      suspiciousEntries,
      denominationInconsistencies,
      dataQualityScore,
    },
    topReferralSource,
    recentRegistrations: buildRecentRegistrations(registrations),
    recommendations: buildRecommendations({
      transportPct: percent(busRequests, total),
      duplicateNames: duplicateNames.length,
      suspiciousEntries: suspiciousEntries.length,
      topReferral: topReferralSource,
      unknownLocationCount,
      unknownDenominationCount,
      total,
    }),
  };
}
