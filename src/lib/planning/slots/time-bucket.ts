import { Slot } from "./slot";
import { Time } from "./time";

export class TimeBucket {
  constructor(public times: Time[]) {
  }

  public cut(slot: Slot): void {
    this.times = this.times.flatMap((t) => t.cut(slot));
  }

  public interpose(slot: Slot): void {
    this.times.forEach((t) => t.interpose(slot));

    this.times.push(new Time(slot.from, slot.duration));
  }
}

