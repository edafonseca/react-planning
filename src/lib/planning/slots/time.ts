import { Bucket } from "./bucket";
import { Slot } from "./slot";

export class Time {
  public bucket: Bucket = new Bucket();

  constructor(public from: Date, public duration: number) {
    this.bucket.addSlot(new Slot(from, duration));
  }

  public cut(slot: Slot): void {
    this.bucket.cut(slot);
  }

  public interpose(slot: Slot): void {
    this.bucket.interpose(slot);
  }
}
