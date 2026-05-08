import { createFileRoute } from "@tanstack/react-router";
import Analytics from "#/sections/Analytics";

export const Route = createFileRoute("/analytics")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Analytics />;
}
