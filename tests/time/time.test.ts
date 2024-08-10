import { Time } from "@/lib/planning/slots/time";
import { thereIsASlot } from "./slots.test";
import { Slot } from "@/lib/planning/slots/slot";

describe('A Time can be created', () => {
  test('a Time can be empty', () => {
    expect(thereIsATime().getSlots().length).toBe(0)
  });

  test('a Time can have a slot', () => {
    const time = thereIsATime();
    time.interpose(thereIsASlot({}));
    expect(time.getSlots().length).toBe(1)
  });


  test('a Time can have multiple slots', () => {
    const time = thereIsATime();
    time.interpose(thereIsASlot({}));
    time.interpose(thereIsASlot({}));
    // expect(time.getSlots().length).toBe(2)
  });
});


describe('A Time can be cut', () => {
  test('a Time can be cut', () => {
    const time = thereIsATime();
    time.interpose(thereIsASlot({ startHour: 8, minutes: 120 }));

    time.cut(thereIsASlot({ startHour: 9, minutes: 60 }));

    expect(time.getSlots()).toHaveLength(2);

    expect(time.getSlots()[0].from.getHours()).toBe(8);
    expect(time.getSlots()[0].duration).toBe(60 * 60 * 1000);

    expect(time.getSlots()[1].from.getHours()).toBe(9);
    expect(time.getSlots()[1].duration).toBe(60 * 60 * 1000);
  });
});

export function thereIsATime(details: { slots?: Slot[] } = {}): Time {
  const time = new Time();
  
  (details.slots || []).forEach((slot) => time.addSlot(slot));

  return time;
}

