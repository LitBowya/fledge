import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Download,
  Filter,
  LayoutDashboard,
  Search,
  Sparkles,
  Table2,
} from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";

import { useRegistrationAnalytics } from "#/sections/analytics/hooks/useRegistrationAnalytics";
import { exportRegistrationsCsv } from "#/sections/analytics/utils/export";
import type { RegistrationRecord } from "#/sections/analytics/types";
import { AnalyticsEmptyState } from "#/sections/analytics/components/AnalyticsEmptyState";
import { AnalyticsSkeleton } from "#/sections/analytics/components/AnalyticsSkeleton";
import { AnalyticsCharts } from "#/sections/analytics/components/AnalyticsCharts";
import { AnalyticsStatCard } from "#/sections/analytics/components/AnalyticsStatCard";
import { AnalyticsTables } from "#/sections/analytics/components/AnalyticsTables";
import { RecentRegistrationsFeed } from "#/sections/analytics/components/RecentRegistrationsFeed";

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt-desc" },
  { label: "Oldest", value: "createdAt-asc" },
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Denomination (A-Z)", value: "denomination-asc" },
  { label: "Location (A-Z)", value: "location-asc" },
] as const;

function safeDateValue(dateValue: RegistrationRecord["createdAt"]) {
  if (!dateValue) return 0;
  const parsed = new Date(dateValue).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortRegistrations(
  rows: RegistrationRecord[],
  sortValue: string,
): RegistrationRecord[] {
  const [key, direction] = sortValue.split("-");
  const dir = direction === "desc" ? -1 : 1;
  const copy = [...rows];

  copy.sort((a, b) => {
    if (key === "createdAt") {
      return (safeDateValue(a.createdAt) - safeDateValue(b.createdAt)) * dir;
    }

    if (key === "name") {
      return a.name.localeCompare(b.name) * dir;
    }

    if (key === "denomination") {
      return a.denomination.localeCompare(b.denomination) * dir;
    }

    if (key === "location") {
      return a.location.localeCompare(b.location) * dir;
    }

    return 0;
  });

  return copy;
}

export default function Analytics() {
  const { analytics, isLoading, isError, error, registrations } =
    useRegistrationAnalytics();

  const [activeTab, setActiveTab] = useState<
    "overview" | "tables" | "insights"
  >("overview");
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] =
    useState<(typeof SORT_OPTIONS)[number]["value"]>("createdAt-desc");

  const filteredRegistrations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return registrations;

    return registrations.filter((registration) => {
      return [
        registration.name,
        registration.contact,
        registration.denomination,
        registration.location,
        registration.referralSource,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [registrations, search]);

  const visibleRegistrations = useMemo(
    () => sortRegistrations(filteredRegistrations, sortValue),
    [filteredRegistrations, sortValue],
  );

  const handleCsvExport = () => {
    exportRegistrationsCsv(visibleRegistrations);
  };

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isError) {
    return (
      <AnalyticsEmptyState
        title="Unable to load analytics"
        description={error instanceof Error ? error.message : "Unknown error"}
      />
    );
  }

  if (!registrations.length) {
    return (
      <AnalyticsEmptyState
        title="No registrations yet"
        description="Once people register, this dashboard will populate with live event intelligence."
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Event Command Center
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Registration Analytics
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Real-time intelligence for attendance, transport demand, referral
            effectiveness, denomination engagement, and event readiness.
          </p>
        </div>

        <Button className="w-full md:w-auto" onClick={handleCsvExport}>
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="analytics-search" className="text-xs">
              Search attendees
            </Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="analytics-search"
                value={search}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSearch(nextValue);

                  if (nextValue.trim()) {
                    setActiveTab("tables");
                  }
                }}
                className="pl-8"
                placeholder="Name, contact, denomination, location, referral..."
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Sort attendees</Label>
            <Select
              value={sortValue}
              onValueChange={(value) => setSortValue(value as typeof sortValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="w-full rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold">
                {visibleRegistrations.length}
              </span>{" "}
              of <span className="font-semibold">{registrations.length}</span>{" "}
              registrations
              {search.trim() && activeTab !== "tables" ? (
                <p className="mt-1 text-[11px] text-muted-foreground/90">
                  Search results are shown in the Tables tab.
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsStatCard
          title="Total Registered"
          value={analytics.core.totalRegistered}
          subtitle="All attendees"
          icon={LayoutDashboard}
        />
        <AnalyticsStatCard
          title="Male Attendees"
          value={analytics.core.totalMales}
          subtitle={`${analytics.core.genderSplit.malePct.toFixed(1)}% of total`}
          icon={ArrowDownUp}
        />
        <AnalyticsStatCard
          title="Female Attendees"
          value={analytics.core.totalFemales}
          subtitle={`${analytics.core.genderSplit.femalePct.toFixed(1)}% of total`}
          icon={ArrowDownUp}
        />
        <AnalyticsStatCard
          title="Bus Return Requests"
          value={analytics.core.totalBusRequests}
          subtitle={`${analytics.core.transportRequestPct.toFixed(1)}% requesting transport`}
          icon={Sparkles}
          progressValue={analytics.core.transportRequestPct}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="w-full"
      >
        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-2">
          <RecentRegistrationsFeed
            registrations={analytics.recentRegistrations}
          />
          <AnalyticsCharts analytics={analytics} />
        </TabsContent>

        <TabsContent value="tables" className="space-y-6 pt-2">
          <AnalyticsTables
            analytics={analytics}
            visibleRegistrations={visibleRegistrations}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 pt-2">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Table2 className="size-4" />
                  Core Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  Unique denominations:{" "}
                  <span className="font-semibold">
                    {analytics.core.totalUniqueDenominations}
                  </span>
                </p>
                <p>
                  Unique locations:{" "}
                  <span className="font-semibold">
                    {analytics.core.totalUniqueLocations}
                  </span>
                </p>
                <p>
                  Referral source entries:{" "}
                  <span className="font-semibold">
                    {analytics.core.totalReferralEntries}
                  </span>
                </p>
                <p>
                  Top referral source:{" "}
                  <span className="font-semibold">
                    {analytics.topReferralSource?.name ?? "N/A"}
                  </span>
                </p>
                <p>
                  Data quality score:{" "}
                  <span className="font-semibold">
                    {analytics.dataQuality.dataQualityScore.toFixed(1)}%
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
