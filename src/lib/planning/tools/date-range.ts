export class DateRange {
  public intervals: { from: Date; to: Date }[] = [];

  constructor(from: Date, to: Date) {
    this.intervals = [{ from, to }];
  }

  add(other: DateRange): void {
    for (const interval of other.intervals) {
      this.intervals.push(interval);
    }
  }

  subtract(other: DateRange): DateRange {
    for (const otherInterval of other.intervals) {
      const tempIntervals: { from: Date; to: Date }[] = [];

      for (const interval of this.intervals) {
        // Si aucun chevauchement, on conserve l'intervalle actuel
        if (
          otherInterval.to <= interval.from ||
          otherInterval.from >= interval.to
        ) {
          tempIntervals.push(interval);
        }
        // Si l'autre intervalle couvre complètement l'intervalle actuel
        else if (
          otherInterval.from <= interval.from &&
          otherInterval.to >= interval.to
        ) {
          continue; // On n'ajoute pas l'intervalle actuel, car il est complètement couvert
        }
        // Si l'autre intervalle chevauche uniquement le début de l'intervalle actuel
        else if (
          otherInterval.from <= interval.from &&
          otherInterval.to < interval.to
        ) {
          tempIntervals.push({ from: otherInterval.to, to: interval.to });
        }
        // Si l'autre intervalle chevauche uniquement la fin de l'intervalle actuel
        else if (
          otherInterval.from > interval.from &&
          otherInterval.to >= interval.to
        ) {
          tempIntervals.push({ from: interval.from, to: otherInterval.from });
        }
        // Si l'autre intervalle est à l'intérieur de l'intervalle actuel
        else if (
          otherInterval.from > interval.from &&
          otherInterval.to < interval.to
        ) {
          tempIntervals.push({ from: interval.from, to: otherInterval.from });
          tempIntervals.push({ from: otherInterval.to, to: interval.to });
        }
      }

      this.intervals = tempIntervals;
    }

    return this;
  }

  getDuration(): number {
    return this.intervals.reduce((total, interval) => {
      return total + (interval.to.getTime() - interval.from.getTime());
    }, 0);
  }
}

