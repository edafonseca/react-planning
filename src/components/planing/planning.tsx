"use client";

import { ModifierListener } from "./modifier-listener";
import { PlanningProvider, useCalendar } from "./planning-provider";
import { DayRange } from "./day-range";
import { PlanningContainer } from "./planning-container";
import { MouseListener } from "./mouse-listener";
import { useEffect } from "react";
import { Slot } from "@/lib/planning/slots/slot";

export const Planning: React.FC = () => {
  const { calendar } = useCalendar();

  useEffect(() => {
    setTimeout(() => {
      const day = calendar.getDays()[0];
      const date = day.date;
      date.setHours(10);
      const slot = new Slot(date, 30 * 60 * 1000);
      day.addSlot(slot);
      console.log(slot, calendar);
    }, 3000);
  }, []);

  return (
    <>
      <ModifierListener />
      <MouseListener />
      <div className="flex justify-content-stretch w-full h-screen">
        <PlanningContainer>
          {calendar.getDays().map((day, i) => (
            <DayRange
              key={day.date.toString() + "-" + i}
              day={day}
            />
          ))}
        </PlanningContainer>
      </div>
    </>
  );
};
