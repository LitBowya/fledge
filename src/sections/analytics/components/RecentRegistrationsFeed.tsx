import { CalendarClock } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { RegistrationRecord } from "#/sections/analytics/types";

type RecentRegistrationsFeedProps = {
  registrations: RegistrationRecord[];
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function formatDate(value: RegistrationRecord["createdAt"]) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString();
}

export function RecentRegistrationsFeed({
  registrations,
}: RecentRegistrationsFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">Recent Registrations Feed</CardTitle>
        <Badge variant="secondary">AI-added analytics</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <AvatarGroup>
          {registrations.slice(0, 4).map((registration) => (
            <Avatar key={registration.id}>
              <AvatarFallback>{getInitials(registration.name)}</AvatarFallback>
            </Avatar>
          ))}
          {registrations.length > 4 ? (
            <AvatarGroupCount>+{registrations.length - 4}</AvatarGroupCount>
          ) : null}
        </AvatarGroup>

        <div className="space-y-2">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">{registration.name}</p>
                <span className="text-xs text-muted-foreground">
                  {registration.location}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3.5" />
                  {formatDate(registration.createdAt)}
                </span>
                <span>•</span>
                <span>{registration.denomination}</span>
                {registration.wantsBusReturnTrip ? (
                  <>
                    <span>•</span>
                    <Badge variant="outline">Transport requested</Badge>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
