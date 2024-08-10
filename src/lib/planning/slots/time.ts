import { Bucket } from "./bucket";
import { Slot } from "./slot";

export class Time {
  public bucket: Bucket = new Bucket();
  public id: string;
  
  private onMoveCallbacks: Array<(slot: Slot) => void> = [];
  color: string;

  constructor(id?: string) {
    this.id = id ?? Math.random().toString(36).substring(7);
    // this.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  public addSlot(slot: Slot): Time {
    this.bucket.addSlot(slot);

    return this;
  }

  public getSlots(): Slot[] {
    return this.bucket.slots;
  }

  public cut(slot: Slot): Time {
    this.bucket.cut(slot);

    return this;
  }

  public interpose(slot: Slot): Time {
    this.bucket.interpose(slot);

    return this;
  }

  // public onMove(callback: (slot: Slot) => void): void {
  //   this.onMoveCallbacks.push(callback);
  // }

  // private triggerOnMove = (slot: Slot) => {
  //   this.onMoveCallbacks.forEach((callback) => callback(slot));
  // }
}
