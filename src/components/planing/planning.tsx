"use client";

import { ModifierListener } from "./modifier-listener";
import { PlanningContext } from "./planning-context";
import { Calendar } from "@/lib/planning/calendar";
import { addDays, format, startOfWeek } from "date-fns";
import { DayRange } from "./day-range";
import { PlanningContainer } from "./planning-container";

const calendar = new Calendar();

export const Planning: React.FC = () => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const showDays = 5;
  const daysOfWeek = [];

  for (let i = 0; i < showDays; i++) {
    daysOfWeek.push(addDays(start, i));
  }

  return (
    <PlanningContext>
      <ModifierListener />
      <div className="flex justify-content-stretch w-full h-screen">
        <PlanningContainer>
          <DayRange key="a" calendar={calendar} date={today} />
          <DayRange key="b" calendar={calendar} date={today} />
        </PlanningContainer>
      </div>
    </PlanningContext>
  );
};
