import { Slot } from "../slots/slot";

export interface ViewRangeInterface {
  // Computes the date from a relative postion (from 0 to 1) in the view range
  getDateFromRelativePosition(p: number, from: Date, rounding: 'floor' | 'ceil', roundMinutes: number): Date;

  // Computes the relative position of a date in the view range for "from" reference day, from 0 to 1
  getRelativePosition(date: Date, from: Date): number | null;

  // Checks if a date is visible in the view range
  isInViewRange(date: Date): boolean;

  // Computes the date at the end of the slot, given the start date and the duration
  getTo(slot: Slot): Date;

  // Computes the duration between two dates (usually start and end of a slot)
  getDurationBetween(from: Date, to: Date): number;
  
}
