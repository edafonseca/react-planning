import { Subject } from "rxjs";
import { ViewRangeInterface } from "../viewrange/ViewrangeInterface";
import { Bucket, Diff } from "./bucket";
import { CalendarSlot } from "./calendar-slot";
import { ManipulableSlotInterface, Slot, SlotInterface } from "./slot";

export class Day extends Subject<unknown> {
  id: string;
  public bucket: Bucket;

  constructor(private viewRange: ViewRangeInterface, public readonly date: Date) {
    super();
    this.id = Math.random().toString(36).substring(7);
    this.bucket = new Bucket();
  }

  public addSlot(slot: SlotInterface, insertMode?: "interpose" | "cut"): Diff {
    const calendarSlot = new CalendarSlot(slot, this.viewRange);
    let diff: Diff = undefined;

    if (undefined === insertMode) {
      diff = this.bucket.addSlot(calendarSlot);
    }

    if ("cut" === insertMode) {
      diff = this.bucket.cut(calendarSlot);
    }

    if ("interpose" === insertMode) {
      diff = this.bucket.interpose(calendarSlot);
    }

    if (undefined !== diff) {
      this.next(this);

      return diff;
    }

    throw new Error("Invalid insert mode");
  }

  public removeSlot(slot: SlotInterface): Diff {
    const diff = this.bucket.removeSlot(slot);
    this.next(this);

    return diff;
  }

  public getSlots(): SlotInterface[] {
    return this.bucket.slots.map((s) => s);
  }

  public replaceBucket(bucket: Bucket): void {
    this.bucket = bucket
    this.next(this);
  }
}
