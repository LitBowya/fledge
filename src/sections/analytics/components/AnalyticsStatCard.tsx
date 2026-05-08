import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import gsap from "gsap";

import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Progress } from "#/components/ui/progress";

type AnalyticsStatCardProps = {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  progressValue?: number;
};

export function AnalyticsStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  progressValue,
}: AnalyticsStatCardProps) {
  const counterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!counterRef.current) return;

    const state = { value: 0 };
    const tween = gsap.to(state, {
      value,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        if (!counterRef.current) return;
        counterRef.current.textContent = Math.round(
          state.value,
        ).toLocaleString();
      },
    });

    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {title}
          <Icon className="size-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div ref={counterRef} className="text-3xl font-semibold tracking-tight">
          0
        </div>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        {typeof progressValue === "number" ? (
          <Progress
            className="bg-[rgba(248,208,110,1)] "
            value={Math.max(0, Math.min(100, progressValue))}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
