import {
  addHours,
  addMilliseconds,
  addMinutes,
  endOfDay,
  startOfDay,
} from "date-fns";
import { Slot, SlotInterface } from "./slots/slot";
import { ViewRangeInterface } from "./ViewrangeInterface";

export class ViewRange implements ViewRangeInterface {
  constructor(
    public from: Date,
    public to: Date,
  ) {}

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

  getRelativePosition(date: Date): number | null {
    return (date.getHours() * 60 + date.getMinutes()) / 1440;
  }

  isInViewRange(date: Date): boolean {
    return true;
  }
}

class WorkingHoursRange extends ViewRange {
  private readonly morning = [8 * 60, 12 * 60];
  private readonly afternoon = [14 * 60, 18 * 60];

  constructor(from: Date, to: Date) {
    super(from, to);
  }

  getDateFromRelativePosition(p: number, from: Date = new Date()): Date {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    let minutes = 0;

    if (p < 0.5) {
      // linearly increase from 08:00 to 12:00
      minutes = 2 * p * (60 * 4) + 60 * 8;
    } else {
      // linearly increase from 14:00 to 18:00
      minutes = 2 * (p - 0.5) * (60 * 4) + 60 * 14;
    }

    // round to 30 minutes
    // minutes = Math.floor(minutes / 30) * 30;

    start.setMinutes(minutes);
    // console.log(start);

    return start;
  }

  isInViewRange(date: Date): boolean {
    const minutes = date.getHours() * 60 + date.getMinutes();

    const isMorning = minutes >= this.morning[0] && minutes < this.morning[1];
    const isAfternoon =
      minutes >= this.afternoon[0] && minutes < this.afternoon[1];

    return isMorning || isAfternoon;
  }

  getRelativePosition(date: Date): number | null {
    const minutes = date.getHours() * 60 + date.getMinutes();

    const morning = this.morning;
    const afternoon = this.afternoon;

    const isMorning = this.isMorning(date);
    const isAfternoon = this.isAfternoon(date);

    if (!isMorning && !isAfternoon) {
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

    return minutes >= this.morning[0] && minutes < this.morning[1];
  }

  private isAfternoon(date: Date): boolean {
    const minutes = date.getHours() * 60 + date.getMinutes();

    return minutes >= this.afternoon[0] && minutes < this.afternoon[1];
  }
}

class DateRange {
  public intervals: { from: Date; to: Date }[] = [];

  constructor(from: Date, to: Date) {
    this.intervals = [{ from, to }];
  }

  add(other: DateRange): void {
    for (const interval of other.intervals) {
      this.intervals.push(interval);
    }
  }

  subtract(other: DateRange): DateRange {
    for (const otherInterval of other.intervals) {
      const tempIntervals: { from: Date; to: Date }[] = [];

      for (const interval of this.intervals) {
        // Si aucun chevauchement, on conserve l'intervalle actuel
        if (
          otherInterval.to <= interval.from ||
          otherInterval.from >= interval.to
        ) {
          tempIntervals.push(interval);
        }
        // Si l'autre intervalle couvre complètement l'intervalle actuel
        else if (
          otherInterval.from <= interval.from &&
          otherInterval.to >= interval.to
        ) {
          continue; // On n'ajoute pas l'intervalle actuel, car il est complètement couvert
        }
        // Si l'autre intervalle chevauche uniquement le début de l'intervalle actuel
        else if (
          otherInterval.from <= interval.from &&
          otherInterval.to < interval.to
        ) {
          tempIntervals.push({ from: otherInterval.to, to: interval.to });
        }
        // Si l'autre intervalle chevauche uniquement la fin de l'intervalle actuel
        else if (
          otherInterval.from > interval.from &&
          otherInterval.to >= interval.to
        ) {
          tempIntervals.push({ from: interval.from, to: otherInterval.from });
        }
        // Si l'autre intervalle est à l'intérieur de l'intervalle actuel
        else if (
          otherInterval.from > interval.from &&
          otherInterval.to < interval.to
        ) {
          tempIntervals.push({ from: interval.from, to: otherInterval.from });
          tempIntervals.push({ from: otherInterval.to, to: interval.to });
        }
      }

      this.intervals = tempIntervals;
    }

    return this;
  }

  getDuration(): number {
    return this.intervals.reduce((total, interval) => {
      return total + (interval.to.getTime() - interval.from.getTime());
    }, 0);
  }
}

export class Calendar {
  public viewrange: ViewRangeInterface;

  constructor() {
    // this.viewrange = new ViewRange(new Date(), new Date());
    this.viewrange = new WorkingHoursRange(new Date(), new Date());
  }
}
