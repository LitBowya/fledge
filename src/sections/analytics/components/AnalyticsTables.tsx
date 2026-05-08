import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import type {
  AnalyticsSnapshot,
  RegistrationRecord,
} from "#/sections/analytics/types";

type AnalyticsTablesProps = {
  analytics: AnalyticsSnapshot;
  visibleRegistrations: RegistrationRecord[];
};

function formatDate(value: RegistrationRecord["createdAt"]) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString();
}

export function AnalyticsTables({
  analytics,
  visibleRegistrations,
}: AnalyticsTablesProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Denomination Intelligence
            </CardTitle>
            <Badge variant="secondary">Normalized + Fuzzy Matching</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Normalized Name</TableHead>
                  <TableHead className="text-right">Attendees</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.chartSeries.denominationGroups.map((group) => (
                  <TableRow key={group.normalizedName}>
                    <TableCell className="max-w-[250px]">
                      <div className="space-y-1">
                        <p className="font-medium">{group.normalizedName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Variants: {group.variants.join(", ")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{group.count}</TableCell>
                    <TableCell className="text-right">
                      {group.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Referral Source Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.chartSeries.referralSources.map((source) => (
                  <TableRow key={source.name}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell className="text-right">{source.count}</TableCell>
                    <TableCell className="text-right">
                      {source.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Attendee Table (Search + Sort)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Denomination</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Referral</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRegistrations.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.sex}</TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {row.denomination}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {row.location}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {row.referralSource}
                  </TableCell>
                  <TableCell>
                    {row.wantsBusReturnTrip ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Location Heatmap Grouping</CardTitle>
          <Badge variant="secondary">AI-added analytics</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {analytics.additionalAnalytics.locationHeatmap.map((point) => (
            <div
              key={point.location}
              className="rounded-lg border p-3"
              style={{
                background:
                  point.level === "high"
                    ? "hsl(222 47% 11% / 0.18)"
                    : point.level === "medium"
                      ? "hsl(221 83% 53% / 0.14)"
                      : "hsl(38 92% 50% / 0.1)",
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{point.location}</p>
                <Badge variant="outline">{point.count}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {point.percentage.toFixed(1)}% • intensity {point.intensity}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
