import { ViewRange } from "./viewrange/viewrange";
import { WorkingHoursRange } from "./viewrange/working-hour-range";
import { ViewRangeInterface } from "./viewrange/ViewrangeInterface";
import { Day } from "./slots/day";
import { Subject } from "rxjs";

type Mode = 'normal' | 'insert';

export class Calendar extends Subject<unknown> {
  public viewrange: ViewRangeInterface;

  private days: Day[] = [];
  private mode: Mode = 'normal';

  constructor() {
    super();
    // this.viewrange = new ViewRange();
    this.viewrange = new WorkingHoursRange();
  }

  public addDay(date: Date): Day {
    const day = new Day(this.viewrange, date);
    day.subscribe(() => this.next(this));

    this.days.push(day);
    this.next(this);

    return day;
  }

  public getDays(): Array<Day> {
    return this.days;
  }

  public setMode(mode: Mode): void {
    this.mode = mode;
    this.next(this);
  }

  public getMode(): Mode {
    return this.mode;
  }
}
