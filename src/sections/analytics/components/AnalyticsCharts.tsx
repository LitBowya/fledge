import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "#/components/ui/chart";
import type { AnalyticsSnapshot } from "#/sections/analytics/types";

type AnalyticsChartsProps = {
  analytics: AnalyticsSnapshot;
};

const CHART_COLORS = {
  slate900: "hsl(222, 47%, 11%)",
  blue600: "hsl(221, 83%, 53%)",
  violet600: "hsl(262, 83%, 58%)",
  amber500: "hsl(38, 92%, 50%)",
  emerald500: "hsl(160, 84%, 39%)",
} as const;

const PIE_SEGMENT_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(38, 92%, 50%)",
  "hsl(160, 84%, 39%)",
  "hsl(222, 47%, 11%)",
] as const;

function fallbackChartData(input: Array<{ name: string; count: number }>) {
  return input.length ? input : [{ name: "No Data", count: 0 }];
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const genderData = fallbackChartData(
    analytics.chartSeries.genderDistribution.map((item) => ({
      name: item.name,
      count: item.count,
    })),
  );

  const transportData = fallbackChartData(
    analytics.chartSeries.transportDistribution.map((item) => ({
      name: item.name,
      count: item.count,
    })),
  );

  const denominationData = fallbackChartData(
    analytics.chartSeries.denominationGroups.map((item) => ({
      name: item.normalizedName,
      count: item.count,
    })),
  );

  const referralData = fallbackChartData(
    analytics.chartSeries.referralSources.map((item) => ({
      name: item.name,
      count: item.count,
    })),
  );

  const trendData =
    analytics.chartSeries.trend.length > 0
      ? analytics.chartSeries.trend
      : [{ date: "N/A", registrations: 0, cumulative: 0 }];

  const locationData = fallbackChartData(
    analytics.chartSeries.topLocations.map((item) => ({
      name: item.name,
      count: item.count,
    })),
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[280px] w-full"
            config={{
              count: { label: "Attendees", color: CHART_COLORS.slate900 },
            }}
          >
            <PieChart>
              <Pie dataKey="count" data={genderData} nameKey="name" innerRadius={55}>
                {genderData.map((entry) => (
                  <Cell
                    key={`gender-${entry.name}`}
                    fill={
                      entry.name === "Male"
                        ? CHART_COLORS.blue600
                        : entry.name === "Female"
                          ? CHART_COLORS.violet600
                          : CHART_COLORS.amber500
                    }
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transport Request Split</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[280px] w-full"
            config={{
              count: { label: "Registrations", color: CHART_COLORS.blue600 },
            }}
          >
            <PieChart>
              <Pie dataKey="count" data={transportData} nameKey="name" outerRadius={90}>
                {transportData.map((entry) => (
                  <Cell
                    key={`transport-${entry.name}`}
                    fill={
                      entry.name === "Requested"
                        ? CHART_COLORS.emerald500
                        : CHART_COLORS.slate900
                    }
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Top Denomination Groups</CardTitle>
          <Badge variant="secondary">Normalized + Fuzzy</Badge>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[320px] w-full"
            config={{
              count: { label: "Attendees", color: CHART_COLORS.violet600 },
            }}
          >
            <BarChart data={denominationData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={80} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                fill={CHART_COLORS.violet600}
              >
                {denominationData.map((item, index) => (
                  <Cell
                    key={`denomination-${item.name}`}
                    fill={PIE_SEGMENT_COLORS[index % PIE_SEGMENT_COLORS.length]}
                  />
                ))}
              </Bar>
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral Source Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[320px] w-full"
            config={{
              count: { label: "Attendees", color: CHART_COLORS.amber500 },
            }}
          >
            <BarChart data={referralData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={70} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill={CHART_COLORS.amber500}>
                {referralData.map((item, index) => (
                  <Cell
                    key={`referral-${item.name}`}
                    fill={PIE_SEGMENT_COLORS[index % PIE_SEGMENT_COLORS.length]}
                  />
                ))}
              </Bar>
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Registration Growth Trend</CardTitle>
          <Badge variant="secondary">AI-added analytics</Badge>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[320px] w-full"
            config={{
              registrations: {
                label: "Daily Registrations",
                color: CHART_COLORS.emerald500,
              },
              cumulative: { label: "Cumulative", color: CHART_COLORS.slate900 },
            }}
          >
            <AreaChart data={trendData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <Area
                dataKey="registrations"
                type="monotone"
                fill={CHART_COLORS.emerald500}
                fillOpacity={0.2}
                stroke={CHART_COLORS.emerald500}
                strokeWidth={2}
              />
              <Area
                dataKey="cumulative"
                type="monotone"
                fill={CHART_COLORS.slate900}
                fillOpacity={0.1}
                stroke={CHART_COLORS.slate900}
                strokeWidth={2}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Top Attendee Locations</CardTitle>
          <Badge variant="secondary">AI-added analytics</Badge>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[320px] w-full"
            config={{
              count: { label: "Attendees", color: CHART_COLORS.blue600 },
            }}
          >
            <BarChart data={locationData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill={CHART_COLORS.blue600}>
                {locationData.map((item, index) => (
                  <Cell
                    key={`location-${item.name}`}
                    fill={PIE_SEGMENT_COLORS[index % PIE_SEGMENT_COLORS.length]}
                  />
                ))}
              </Bar>
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
