import { addMilliseconds, addMinutes, endOfDay } from "date-fns";

export class Slot {
  public id: string;

  constructor(
    public from: Date,
    public duration: number, // milliseconds
  ) {
    // Generate a unique id for the slot
    this.id = Math.random().toString(36).substring(7);
  }

  get to(): Date {
    const untilEndOfDay = endOfDay(this.from).getTime() - this.from.getTime();

    return addMilliseconds(this.from, Math.min(untilEndOfDay, this.duration));
  }

  public overlaps(slot: Slot): boolean {
    return this.from < slot.to && this.to > slot.from;
  }

  public shiftStart(date: Date): Slot {
    const delta = date.getTime() - this.from.getTime();

    return new Slot(addMilliseconds(this.from, delta), this.duration);
  }

  public split(date: Date): [Slot, Slot] {
    return [
      new Slot(this.from, date.getTime() - this.from.getTime()),
      new Slot(date, this.to.getTime() - date.getTime()),
    ];
  }

  public cut(slot: Slot): Slot[] {
    if (!this.overlaps(slot)) {
      return [this];
    }

    const filter = (slots: Slot[]) => slots.filter((s) => s.from < s.to);

    if (this.from > slot.from) {
      return filter([new Slot(slot.to, this.to.getTime() - slot.to.getTime())]);
    }

    if (this.to > slot.to) {
      return filter([
        new Slot(this.from, slot.from.getTime() - this.from.getTime()),
        new Slot(slot.to, this.to.getTime() - slot.to.getTime()),
      ]);
    }

    return filter([
      new Slot(this.from, slot.from.getTime() - this.from.getTime()),
    ]);
  }

  public interpose(slot: Slot): Slot[] {
    if (!this.overlaps(slot)) {
      return [this];
    }

    if (slot.from <= this.from) {
      return [this.shiftStart(slot.to)];
    }

    const [a, b] = this.split(slot.from);

    return [a, b.shiftStart(slot.to)];
  }

  public equals(s: Slot) {
    return (
      this.from.getTime() === s.from.getTime() &&
      this.to.getTime() === s.to.getTime()
    );
  }
}
