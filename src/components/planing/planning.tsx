"use client";

import { ModifierListener } from "./modifier-listener";
import { PlanningContext } from "./planning-context";
import { Calendar } from "@/lib/planning/calendar";
import { addDays, format, startOfWeek } from "date-fns";
import { DayRange } from "./day-range";

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
        <DayRange calendar={calendar} date={new Date()} />
        <DayRange calendar={calendar} date={new Date()} />
        {daysOfWeek.map((day) => (
          <DayRange
            key={format(day, "yyyy-MM-dd")}
            calendar={calendar}
            date={day}
          />
        ))}
      </div>
    </PlanningContext>
  );
};
