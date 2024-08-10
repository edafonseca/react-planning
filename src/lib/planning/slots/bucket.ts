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
    this.slots.sort((a, b) => a.from.getTime() - b.from.getTime());

    const toAdd = [...this.slots.filter((s) => s.to >= slot.from)];
    this.slots = [...this.slots.filter((s) => s.to < slot.from), slot];

    let next = toAdd.shift();
    let b: Slot | undefined = undefined;

    while (undefined !== next) {
      this.slots.forEach((s) => {
        [next, b] = next!.interpose(s);

        if (b !== undefined) {
          toAdd.unshift(b);
        }
      });
      this.slots.push(next);

      next = toAdd.shift();
      this.slots.sort((a, b) => a.from.getTime() - b.from.getTime());
    }
  }
}
