import { Day } from "@/lib/planning/slots/day";
import { thereIsATime } from "./time.test";
import { thereIsASlot } from "./slots.test";

describe('A day is a collection of times', () => {
  test('a day can be empty', () => {
    const day = thereIsADay();
    expect(day.times.length).toBe(0);
  })

  test('a day can have a time', () => {
    const day = thereIsADay();
    const time = thereIsATime();
    time.interpose(thereIsASlot({ startHour: 8, minutes: 120 }));

    day.addTime(time, 'cut');

    expect(day.times.length).toBe(1);
    expect(day.times[0].getSlots()[0].from.getHours()).toBe(8);
  });

  // test('a day with a time can be cut', () => {
  //   const day = thereIsADay();
  //
  //   day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 8, minutes: 120 })] }), 'cut');
  //   day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 9, minutes: 60  })] }), 'cut');
  //
  //   expect(day.times[0].getSlots()).toHaveLength(1);
  //   expect(day.times[1].getSlots()).toHaveLength(1);
  //
  //   expect(day.times[0].getSlots()[0].from.getHours()).toBe(8);
  //   expect(day.times[0].getSlots()[0].to.getHours()).toBe(9);
  //   
  //   expect(day.times[1].getSlots()[0].from.getHours()).toBe(9);
  //   expect(day.times[1].getSlots()[0].to.getHours()).toBe(10);
  // });

  test('a day with a time can be interposed', () => {
    const day = thereIsADay();

    day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 8, minutes: 120 })] }), 'interpose');
    day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 9, minutes: 60  })] }), 'interpose');

    expect(day.times[0].getSlots()).toHaveLength(2);
    expect(day.times[1].getSlots()).toHaveLength(1);

    expect(day.times[0].getSlots()[0].from.getHours()).toBe(8);
    expect(day.times[0].getSlots()[0].to.getHours()).toBe(9);
    expect(day.times[0].getSlots()[1].from.getHours()).toBe(10);
    expect(day.times[0].getSlots()[1].to.getHours()).toBe(11);
    
    expect(day.times[1].getSlots()[0].from.getHours()).toBe(9);
    expect(day.times[1].getSlots()[0].to.getHours()).toBe(10);
  });

  test('a time interposed can interpose another time', () => {
    const day = thereIsADay();

    day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 8, minutes: 120 })] }), 'interpose');
    day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 10, minutes: 60  })] }), 'interpose');
    day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 9, minutes: 60  })] }), 'interpose');

    expectDay(day, [
      [[8, 9], [10, 11]],
      [[11, 12]],
      [[9, 10]],
    ]);

    day.addTime(thereIsATime({ slots: [thereIsASlot({ startHour: 9, minutes: 60  })] }), 'interpose');
    expectDay(day, [
      [[8, 9], [11, 12]],
      [[12, 13]],
      [[10, 11]],
      [[9, 10]],
    ]);
  });
});

function thereIsADay() {
  return new Day();
}

function expectDay(received: Day, times: Array<[number, number][]>) {
    times.forEach((time, i) => {
      time.forEach((slot, j) => {
        expect(received.times[i].getSlots()[j].from.getHours()).toBe(slot[0]);
        expect(received.times[i].getSlots()[j].to.getHours()).toBe(slot[1]);
      });
    });
}
