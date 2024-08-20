import { Day } from "@/lib/planning/slots/day";

describe('A day is a collection of times', () => {
  test('a day can be empty', () => {
    const day = thereIsADay();
    expect(day.getSlots().length).toBe(0);
  })
});

function thereIsADay() {
  return new Day();
}

