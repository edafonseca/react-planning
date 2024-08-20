import { ViewRangeInterface } from "../ViewrangeInterface";
import { ManipulableSlotInterface, Slot, SlotInterface } from "./slot";

export class CalendarSlot implements ManipulableSlotInterface {

  constructor(
    public slot: SlotInterface,
    private viewrange: ViewRangeInterface,
  ) {}

  public get from(): Date {
    return this.slot.from;
  }

  public set from(date: Date) {
    this.slot.from = date;
  }

  public get to(): Date {
    return this.viewrange.getTo(this.slot);
  }

  public get duration(): number {
    return this.slot.duration;
  }

  public get id(): string {
    return this.slot.id;
  }

  public clone(): ManipulableSlotInterface {
    return new CalendarSlot(this.slot.clone(), this.viewrange);
  }

  public equals(slot: SlotInterface): boolean {
    return this.slot.equals(slot);
  }

  public overlaps(slot: ManipulableSlotInterface): boolean {
    return this.from < slot.to && this.to > slot.from;
  }

  public shiftStart(date: Date): ManipulableSlotInterface {
    if (date.getDate() !== this.from.getDate()) {
      throw new Error("Can not shift slot to a different day");
    }

    this.from = date;

    return this;
  }

  public split(date: Date): [Slot, Slot] {
    return [
      new Slot(this.from, this.viewrange.getDurationBetween(this.from, date), this.id),
      new Slot(date, this.viewrange.getDurationBetween(date, this.to), this.id),
    ];
  }

  public cut(slot: ManipulableSlotInterface): ManipulableSlotInterface[] {
    if (!this.overlaps(slot)) {
      return [this];
    }

    const filter = (slots: Slot[]) =>
      slots
        .map((s) => new CalendarSlot(s, this.viewrange))
        .filter((s) => s.from < s.to);

    if (this.from > slot.from) {
      return filter([
        new Slot(
          slot.to,
          this.viewrange.getDurationBetween(slot.to, this.to),
          this.id,
        ),
      ]);
    }

    if (this.to > slot.to) {
      return filter([
        new Slot(
          this.from,
          this.viewrange.getDurationBetween(this.from, slot.from),
          this.id,
        ),
        new Slot(
          slot.to,
          this.viewrange.getDurationBetween(slot.to, this.to),
          this.id,
        ),
      ]);
    }

    return filter([
      new Slot(
        this.from,
        this.viewrange.getDurationBetween(this.from, slot.from),
        this.id,
      ),
    ]);
  }

  public interpose(slot: ManipulableSlotInterface): ManipulableSlotInterface[] {
    if (!this.overlaps(slot)) {
      return [new CalendarSlot(this.slot.clone(), this.viewrange)];
    }

    if (slot.from <= this.from) {
      return [this.clone().shiftStart(slot.to)];
    }

    const [a, b] = this.split(slot.from);

    return [
      new CalendarSlot(a, this.viewrange),
      new CalendarSlot(b, this.viewrange).shiftStart(slot.to),
    ];
  }
}
