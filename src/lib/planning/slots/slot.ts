export interface SlotInterface {
  from: Date;
  duration: number;
  id: string;
  clone(): SlotInterface;
  equals(slot: SlotInterface): boolean;
}

export interface ManipulableSlotInterface extends SlotInterface {
  to: Date;
  shiftStart(date: Date): ManipulableSlotInterface;
  split(date: Date): [SlotInterface, SlotInterface];
  cut(slot: ManipulableSlotInterface): ManipulableSlotInterface[];
  interpose(slot: ManipulableSlotInterface): ManipulableSlotInterface[];
  overlaps(slot: ManipulableSlotInterface): boolean;
}

export class Slot implements SlotInterface {
  public id: string;

  constructor(
    public from: Date,
    public duration: number, // milliseconds
    id?: string,
  ) {
    // Generate a unique id for the slot
    this.id = id ?? Math.random().toString(36).substring(7);
  }

  public equals(s: SlotInterface) {
    return (
      this.from.getTime() === s.from.getTime() &&
      this.duration === s.duration &&
      this.id === s.id
    );
  }

  public clone(): Slot {
    return new Slot(this.from, this.duration, this.id);
  }
}
