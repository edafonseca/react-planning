import { ViewRange } from "@/lib/planning/calendar";
import { Bucket } from "@/lib/planning/slots/bucket";
import { CalendarSlot } from "@/lib/planning/slots/calendar-slot";
import { Slot } from "@/lib/planning/slots/slot";
import { addHours, startOfDay } from "date-fns";

describe('A bucket is a collection of slots', () => {
  test('interpose', () => {
    exceptBucket([
      '___000____',
      '_____1____',
      '___0010___',
    ])

    exceptBucket([
      '___0______',
      '___1______',
      '___10_____',
    ])

    exceptBucket([
      '0_________',
      '1_________',
      '10________',
    ])

    exceptBucket([
      '__00______',
      '1111______',
      '111100____',
    ])

    exceptBucket([
      '__00___11_',
      '____222___',
      '__0022211_',
    ])

    exceptBucket([
      '___0000___',
      '____11____',
      '___011000_',
    ])

    exceptBucket([
      '00_11_2___',
      '333_______',
      '33300112__',
    ])

    exceptBucket([
      '00011_2___',
      '333_______',
      '333000112_',
    ])

    exceptBucket([
      '_01_______',
      '__4_______',
      '_041______',
    ])

    exceptBucket([
      '_0011_____',
      '2222______',
      '22220011__',
    ])

    exceptBucket([
      '_0011122__',
      '____3_____',
      '_00131122_',
    ])
  });
});


const exceptBucket = (test: [string, string, string]) => {
  const [initial, slot, expected] = test;
  
  const bucket = new Bucket(convertStringToSlots(initial));
  for (const toInterpose of convertStringToSlots(slot)) {
    bucket.interpose(toInterpose);
  }

  const expectedSlots = convertStringToSlots(expected);

  expect(bucket.slots).toHaveLength(expectedSlots.length);

  expectedSlots.forEach((expectedSlot, index) => {
    expect(bucket.slots[index].from).toEqual(expectedSlot.from);
    expect(bucket.slots[index].to).toEqual(expectedSlot.to);
  });



}


const convertStringToSlots = (str: string) => {
  const slots = [];

  let currentSlot = null; 

  for (let i = 0; i < str.length; i++) {
    if ((currentSlot !== null && str[i] !== currentSlot?.id) || str[i] === '_') {
      if (null !== currentSlot) {
        const date = addHours(startOfDay(new Date()), currentSlot.start);
        const slot = new Slot(date, currentSlot.duration * 60 * 60 * 1000);
        slots.push(slot);

        currentSlot = null;
      }
    }

    if (null === currentSlot && str[i] !== '_') {
      currentSlot = {
        id: str[i],
        start: i,
        duration: 0,
      }
    }

    if (currentSlot !== null) {
      currentSlot.duration++;
    }
  }

  return slots.map(s => new CalendarSlot(s, new ViewRange(new Date(), new Date())));
};
