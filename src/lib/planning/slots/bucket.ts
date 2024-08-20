import { CalendarSlot } from "./calendar-slot";
import { ManipulableSlotInterface, SlotInterface } from "./slot";

export class Diff {
  private oldSlots: SlotInterface[] = [];
  private newSlots: SlotInterface[] = [];

  constructor(bucket: Bucket) {
    this.oldSlots = [...bucket.slots];
  }
  
  public diff(bucket: Bucket): Diff {
    this.newSlots = [...bucket.slots];

    return this;
  }

  public all(): SlotInterface[] {
    return this.newSlots
      .filter((s) => !this.oldSlots.some((bs) => bs.equals(s)))
  }
}

export class Bucket {

  constructor(public slots: ManipulableSlotInterface[] = []) {
  }

  public addSlot(slot: CalendarSlot): Diff {
    const diff = new Diff(this); 

    this.slots.push(slot);
    
    return diff.diff(this);
  }

  public cut(slot: ManipulableSlotInterface): Diff {
    const diff = new Diff(this); 

    this.slots = this.slots.flatMap((s) => s.cut(slot));
    this.slots.push(slot);

    return diff.diff(this);
  }

  public interpose(slot: ManipulableSlotInterface): Diff {
    const diff = new Diff(this); 

    this.slots.sort((a, b) => a.from.getTime() - b.from.getTime());

    const toAdd = [...this.slots.filter((s) => s.to >= slot.from)];
    this.slots = [...this.slots.filter((s) => s.to < slot.from), slot];

    let next = toAdd.shift();
    let b: ManipulableSlotInterface | undefined = undefined;

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

    return diff.diff(this);
  }
}
