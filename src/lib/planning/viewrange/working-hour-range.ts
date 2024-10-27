import {
  addMilliseconds,
  addMinutes,
  endOfDay,
  startOfDay,
} from "date-fns";
import { Slot } from "../slots/slot";
import { DateRange } from "../tools/date-range";
import { ViewRange } from "./viewrange";

export class WorkingHoursRange extends ViewRange {
  private readonly morning = [8 * 60, 12 * 60];
  private readonly afternoon = [14 * 60, 18 * 60];

  constructor(from: Date, to: Date) {
    super(from, to);
  }

  getDateFromRelativePosition(p: number, from: Date = new Date(), rounding: 'floor' | 'ceil' = 'floor', roundMinutes: number = 15): Date {
    const start = startOfDay(from);

    let minutes = 0;

    if (p < 0.5) {
      // linearly increase from 08:00 to 12:00
      minutes = 2 * p * (60 * 4) + 60 * 8;
    } else {
      // linearly increase from 14:00 to 18:00
      minutes = 2 * (p - 0.5) * (60 * 4) + 60 * 14;
    }

    // round
    if (rounding === 'floor') {
      minutes = Math.floor(minutes / roundMinutes) * roundMinutes;
    } else if (rounding === 'ceil') {
      minutes = Math.ceil(minutes / roundMinutes) * roundMinutes;
    }

    start.setMinutes(minutes);

    return start;
  }

  isInViewRange(date: Date): boolean {
    const isMorning = this.isMorning(date);
    const isAfternoon = this.isAfternoon(date);

    return isMorning || isAfternoon;
  }

  getRelativePosition(date: Date, from: Date): number | null {
    const reference = startOfDay(from);

    const [a, b, c, d] = [new Date(reference.setHours(8, 0, 0, 0)), new Date(reference.setHours(12, 0, 0, 0)), new Date(reference.setHours(14, 0, 0, 0)), new Date(reference.setHours(18, 0, 0, 0))];
    const minutes = date.getHours() * 60 + date.getMinutes();

    const morning = this.morning;
    const afternoon = this.afternoon;

    const isMorning = this.isMorning(date);
    const isAfternoon = this.isAfternoon(date);

    if (!isMorning && !isAfternoon) {
      if (date < a) {
        return 0;
      }

      if (date > d) {
        return 1;
      }

      return null;
    }

    if (isMorning) {
      return (minutes - morning[0]) / (morning[1] - morning[0]) / 2;
    }

    if (isAfternoon) {
      return (minutes - afternoon[0]) / (afternoon[1] - afternoon[0]) / 2 + 0.5;
    }

    return null;
  }

  getTo(slot: Slot): Date {
    const from = slot.from;
    const to = addMilliseconds(from, slot.duration);

    if (!this.isInViewRange(from)) {
      return to;
    }

    if (this.isMorning(from)) {
      if (!this.isMorning(to)) {
        return addMinutes(to, 120);
      }
    }

    return to;
  }

  getDurationBetween(from: Date, to: Date): number {
    const range = new DateRange(from, to);
    range.subtract(this.getRangeFrom(from));

    return range.getDuration();
  }

  private getRangeFrom(date: Date): DateRange {
    const start = startOfDay(date);

    return new DateRange(start, endOfDay(start))
      .subtract(
        new DateRange(
          addMinutes(start, this.morning[0]),
          addMinutes(start, this.morning[1]),
        ),
      )
      .subtract(
        new DateRange(
          addMinutes(start, this.afternoon[0]),
          addMinutes(start, this.afternoon[1]),
        ),
      );
  }

  private isMorning(date: Date): boolean {
    const minutes = date.getHours() * 60 + date.getMinutes();

    return minutes >= this.morning[0] && minutes <= this.morning[1];
  }

  private isAfternoon(date: Date): boolean {
    const minutes = date.getHours() * 60 + date.getMinutes();

    return minutes >= this.afternoon[0] && minutes <= this.afternoon[1];
  }
}

