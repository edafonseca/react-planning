import { ViewRangeInterface } from "../viewrange/ViewrangeInterface";
import { Bucket, Diff } from "./bucket";
import { CalendarSlot } from "./calendar-slot";
import { Slot } from "./slot";

export class Day {
  id: string;
  private bucket: Bucket;

  constructor(private viewRange: ViewRangeInterface) {
    this.id = Math.random().toString(36).substring(7);
    this.bucket = new Bucket();
  }

  public addSlot(slot: Slot, insertMode?: "interpose" | "cut"): Diff {
    const calendarSlot = new CalendarSlot(slot, this.viewRange);

    if (undefined === insertMode) {
      return this.bucket.addSlot(calendarSlot);
    }

    if ("cut" === insertMode) {
      return this.bucket.cut(calendarSlot);
    }

    if ("interpose" === insertMode) {
      return this.bucket.interpose(calendarSlot);
    }

    throw new Error("Invalid insert mode");
  }

  public getSlots(): Slot[] {
    return this.bucket.slots.map((s) => s.slot);
  }
}
