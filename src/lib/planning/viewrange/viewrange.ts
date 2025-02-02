import {
  addMilliseconds,
  endOfDay,
} from "date-fns";
import { SlotInterface } from "../slots/slot";
import { ViewRangeInterface } from "./ViewrangeInterface";

export class ViewRange implements ViewRangeInterface {
  getTo(slot: SlotInterface): Date {
    const untilEndOfDay = endOfDay(slot.from).getTime() - slot.from.getTime();

    return addMilliseconds(slot.from, Math.min(untilEndOfDay, slot.duration));
  }

  getDurationBetween(from: Date, to: Date): number {
    return to.getTime() - from.getTime();
  }

  getDateFromRelativePosition(p: number, from: Date = new Date()) {
    const start = new Date(from);

    start.setHours(0, 0, 0, 0);
    start.setMinutes(Math.floor((p * 60 * 24) / 30) * 30);

    return start;
  }

  getRelativePosition(date: Date, from: Date): number | null {
    return (date.getHours() * 60 + date.getMinutes()) / 1440;
  }

  isInViewRange(date: Date): boolean {
    return true;
  }
}
