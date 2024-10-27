import { ViewRange } from "./viewrange/viewrange";
import { WorkingHoursRange } from "./viewrange/working-hour-range";
import { ViewRangeInterface } from "./viewrange/ViewrangeInterface";


export class Calendar {
  public viewrange: ViewRangeInterface;

  constructor() {
    // this.viewrange = new ViewRange(new Date(), new Date());
    this.viewrange = new WorkingHoursRange(new Date(), new Date());
  }
}
