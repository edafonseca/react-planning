import { Bucket } from "./bucket";
import { Slot } from "./slot";
import { Time } from "./time";

export class Day {
  times: Time[] = [];
  id: string;

  constructor() {
    this.id = Math.random().toString(36).substring(7);
  }

  public addTime(time: Time, insertMode: "interpose" | "cut"): void {
    const map: { [timeId: string]: string[] } = this.times.reduce(
      (acc, t) => ({
        ...acc,
        [t.id]: t
          .getSlots()
          .reduce((sAcc, s) => ({ ...sAcc, [s.id]: true }), {}),
      }),
      {},
    );

    const bucket = new Bucket(this.times.flatMap((t) => t.getSlots()));

    time.getSlots().forEach((slot) => {
      insertMode === "cut" && bucket.cut(slot);
      insertMode === "interpose" && bucket.interpose(slot);
    });

    const slotsById: { [slotId: string]: Slot[] } = bucket.slots.reduce(
      (acc, s) => ({ ...acc, [s.id ?? "0"]: [...(acc[s.id] ?? []), s] }),
      {},
    );

    this.times = [];
    Object.keys(map).forEach((timeId) => {
      const t = new Time(timeId);

      Object.keys(map[timeId])
        .map((id) => slotsById[id])
        .forEach((slots) => {
          slots && slots.forEach((slot) => t.addSlot(slot));
        });

      this.times.push(t);
    });

    this.times.push(time);
  }
}
