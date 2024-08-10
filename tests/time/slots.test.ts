import { Slot } from '@/lib/planning/slots/slot';
import { Time } from '@/lib/planning/slots/time';
import { addMinutes, endOfDay } from 'date-fns';
import { format } from 'date-fns/format';

describe('Slots must never end on a different day', () => {
  test('a slot can end on same day', () => {
    const slot = thereIsASlot({ startHour: 8, minutes: 60 });

    expect(format(slot.to, 'HH:mm')).toBe('09:00');
  });

  test('a slot with a duration over the end of the day ends at the end of the day', () => {
    const slot = thereIsASlot({ startHour: 23, minutes: 120 });

    expect(slot.to).toEqual(endOfDay(slot.from));
  });

  test('a shifted slot can not end on a different day', () => {
    const slot = thereIsASlot({ startHour: 10, minutes: 60 });
    shiftSlot(slot, { minutes: 60 * 13 });

    expect(slot.to).toEqual(endOfDay(slot.from));
  });

});

describe('Slots can be shifted', () => {
  test('a slot can be shifted to a different start date', () => {
    const slot = thereIsASlot({ startHour: 8, minutes: 60 });
    shiftSlot(slot, { minutes: 10 })

    expect(format(slot.from, 'HH:mm')).toBe('08:10');
  });

  test('a slot can not be shifted to the next day', () => {
    const slot = thereIsASlot({ startHour: 23, minutes: 120 });

    expect(() => {
      shiftSlot(slot, { minutes: 60 })
    }).toThrow('Can not shift slot to a different day');
  });

  test('a slot can not be shifted to the previous day', () => {
    const slot = thereIsASlot({ startHour: 0, minutes: 120 });

    expect(() => {
      shiftSlot(slot, { minutes: -60 })
    }).toThrow('Can not shift slot to a different day');
  });
});

describe('Slots can overlap', () => {
  test('a slot overlaps with itself', () => {
    const slot = thereIsASlot({ startHour: 8, minutes: 60 });

    expect(slot.overlaps(slot)).toBe(true);
  });

  test('a slot overlaps with a slot that starts before it ends', () => {
    const slot1 = thereIsASlot({ startHour: 8, minutes: 120 });
    const slot2 = thereIsASlot({ startHour: 9 });

    expect(slot1.overlaps(slot2)).toBe(true);
  });

  test('a slot overlaps with a slot that ends after it starts', () => {
    const slot1 = thereIsASlot({ startHour: 8 });
    const slot2 = thereIsASlot({ startHour: 7, minutes: 120 });

    expect(slot1.overlaps(slot2)).toBe(true);
  });

  test('a slot does not overlap with a slot that ends before it starts', () => {
    const slot1 = thereIsASlot({ startHour: 8 });
    const slot2 = thereIsASlot({ startHour: 6, minutes: 60 });

    expect(slot1.overlaps(slot2)).toBe(false); 
  });
});


// describe('Slots behavior', () => {
//   test('aaa', () => {
//     '.....00000.11111........'
//     '......22................'
//     '.....022000011111.......'
//   });
// });

export function thereIsASlot(details: { startHour?: number; startMinutes?: number, minutes?: number; }) {
  const slot = new Slot(
    new Date(2021, 1, 1, details.startHour || 0, details.startMinutes || 0),
    (details.minutes || 60) * 60 * 1000,
    // thereIsATime(),
  );
  return slot;
}

function thereIsATime() {
  const time = new Time();

  return time;
}

function shiftSlot(slot: Slot, details: { minutes: number; }) {
  slot.shiftStart(addMinutes(slot.from, details.minutes));
}
