'use client';

import { Planning } from "@/components/planing/planning";
import { PlanningProvider } from "@/components/planing/planning-provider";

export default function Home() {
  return (
    <PlanningProvider>
      <Planning />
    </PlanningProvider>
  );
}
