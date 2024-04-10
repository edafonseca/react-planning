import { Slot } from "./slot";

export class Bucket {
  constructor(public slots: Slot[] = []) {}

  public addSlot(slot: Slot): void {
    this.slots.push(slot);
  }

  public getOverlaping(slot: Slot): Slot[] {
    return this.slots.filter((s) => s.overlaps(slot));
  }

  public cut(slot: Slot): void {
    this.slots = this.slots.flatMap((s) => s.cut(slot));
    this.slots.push(slot);
  }

  public interpose(slot: Slot): void {
    const rest: Slot[] = [];

    this.slots = this.slots.flatMap((s) => {
      const subSlots = s.interpose(slot);

      subSlots
        .filter((subSlot) => !subSlot.equals(s))
        .forEach((subSlot) => rest.push(subSlot));
      // subSlots.filter((subSlot) => !subSlot.equals(s)).forEach((subSlot) => this.interpose(subSlot));

      return subSlots.filter((subSlot) => subSlot.equals(s));
    });

    this.slots.push(slot);

    rest.reverse().forEach((slot) => this.interpose(slot));
  }
}
