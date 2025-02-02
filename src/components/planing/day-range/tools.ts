import { Calendar } from "@/lib/planning/calendar";
import { Slot } from "@/lib/planning/slots/slot";
import { min, max, roundToNearestMinutes } from "date-fns";

export const createSlotFromDates = (from: Date, to: Date, calendar: Calendar, id?: string) => {
  const dates = [from, to];

  return new Slot(min(dates), calendar.viewrange.getDurationBetween(min(dates), max(dates)), id);
};

export const round = (date: Date, method: 'floor' | 'ceil' = 'floor') => roundToNearestMinutes(date, { roundingMethod: method, nearestTo: 15 });
