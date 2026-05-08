export type RegistrationRecord = {
  id: number;
  name: string;
  sex: string;
  contact: string;
  isAttending: boolean;
  denomination: string;
  location: string;
  referralSource: string;
  expectations?: string | null;
  wantsBusReturnTrip: boolean;
  createdAt: string | Date | null;
  isReturning?: boolean | null;
};

export type MetricSplit = {
  count: number;
  percentage: number;
};

export type GroupMetric = {
  name: string;
  count: number;
  percentage: number;
};

export type DenominationGroup = GroupMetric & {
  normalizedName: string;
  variants: string[];
};

export type TrendPoint = {
  date: string;
  registrations: number;
  cumulative: number;
};

export type LocationHeatmapPoint = {
  location: string;
  count: number;
  percentage: number;
  intensity: number;
  level: "low" | "medium" | "high";
};

export type DuplicateName = {
  name: string;
  count: number;
};

export type SuspiciousEntry = {
  id: number;
  name: string;
  reason: string;
};

export type DenominationInconsistency = {
  normalizedName: string;
  variants: string[];
  count: number;
};

export type Recommendation = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  aiAdded: boolean;
};

export type AnalyticsSnapshot = {
  core: {
    totalRegistered: number;
    totalMales: number;
    totalFemales: number;
    totalBusRequests: number;
    genderSplit: {
      malePct: number;
      femalePct: number;
    };
    transportRequestPct: number;
    totalUniqueDenominations: number;
    totalUniqueLocations: number;
    totalReferralEntries: number;
  };
  chartSeries: {
    genderDistribution: GroupMetric[];
    transportDistribution: GroupMetric[];
    denominationGroups: DenominationGroup[];
    referralSources: GroupMetric[];
    trend: TrendPoint[];
    topLocations: GroupMetric[];
  };
  additionalAnalytics: {
    locationHeatmap: LocationHeatmapPoint[];
    firstTimeVsReturning: {
      firstTime: MetricSplit;
      returning: MetricSplit;
      unknown: MetricSplit;
      architectureNote: string;
    };
    busDemandInsights: {
      demandPercentage: number;
      topBusDemandLocation: string;
      topBusDemandDenomination: string;
    };
    mostEngagedDenominationGroups: DenominationGroup[];
    contactCompleteness: {
      withContact: MetricSplit;
      validContactFormat: MetricSplit;
    };
  };
  dataQuality: {
    duplicateNames: DuplicateName[];
    suspiciousEntries: SuspiciousEntry[];
    denominationInconsistencies: DenominationInconsistency[];
    dataQualityScore: number;
  };
  topReferralSource: GroupMetric | null;
  recentRegistrations: RegistrationRecord[];
  recommendations: Recommendation[];
};
