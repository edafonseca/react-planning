import { addMilliseconds, addMinutes, endOfDay } from "date-fns";



export class Slot {
  public id: string;

  constructor(
    public from: Date,
    public duration: number, // milliseconds
    id?: string,
  ) {
    // Generate a unique id for the slot
    this.id = id ?? Math.random().toString(36).substring(7);
  }

  get to(): Date {
    const untilEndOfDay = endOfDay(this.from).getTime() - this.from.getTime();

    return addMilliseconds(this.from, Math.min(untilEndOfDay, this.duration));
  }

  public overlaps(slot: Slot): boolean {
    return this.from < slot.to && this.to > slot.from;
  }

  public shiftStart(date: Date): Slot {
    if (date.getDate() !== this.from.getDate()) {
      throw new Error("Can not shift slot to a different day");
    }

    this.from = date;

    return this;
  }

  public split(date: Date): [Slot, Slot] {
    return [
      new Slot(this.from, date.getTime() - this.from.getTime(), this.id),
      new Slot(date, this.to.getTime() - date.getTime(), this.id),
    ];
  }

  public cut(slot: Slot): Slot[] {
    if (!this.overlaps(slot)) {
      return [this];
    }

    const filter = (slots: Slot[]) => slots.filter((s) => s.from < s.to);

    if (this.from > slot.from) {
      return filter([new Slot(slot.to, this.to.getTime() - slot.to.getTime(), this.id)]);
    }

    if (this.to > slot.to) {
      return filter([
        new Slot(this.from, slot.from.getTime() - this.from.getTime(), this.id),
        new Slot(slot.to, this.to.getTime() - slot.to.getTime(), this.id),
      ]);
    }

    return filter([
      new Slot(this.from, slot.from.getTime() - this.from.getTime(), this.id),
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
