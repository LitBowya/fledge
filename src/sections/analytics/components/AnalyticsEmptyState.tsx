import { ChartColumn } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";

type AnalyticsEmptyStateProps = {
  title: string;
  description: string;
};

export function AnalyticsEmptyState({
  title,
  description,
}: AnalyticsEmptyStateProps) {
  return (
    <section className="mx-auto flex min-h-[50vh] w-full max-w-4xl items-center px-4 py-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartColumn />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  );
}
