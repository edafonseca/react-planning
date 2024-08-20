import { Slot } from "./slots/slot";

export interface ViewRangeInterface {
  getDateFromRelativePosition(p: number, from: Date): Date;
  getRelativePosition(date: Date): number | null;
  isInViewRange(date: Date): boolean;
  getRelativePosition(date: Date): number | null;
  getTo(slot: Slot): Date;
  getDurationBetween(from: Date, to: Date): number;
}
