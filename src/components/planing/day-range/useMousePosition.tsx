import { Calendar } from '@/lib/planning/calendar';
import { Day } from '@/lib/planning/slots/day';
import { listenMousePosition, MousePosition } from '@/lib/planning/tools/mouse-position';
import { useEffect, useMemo, useState } from 'react';

type MousePositionState = [Date, boolean, MousePosition | null];

export const useMousePosition = (
  element: HTMLElement | null,
  updateMousePosition: boolean,
  day: Day,
  calendar: Calendar
): MousePositionState => {
  const [mousePosition, setMousePosition] = useState<MousePosition | null>(null);
  const [mouseIn, setMouseIn] = useState(false);

  const pointingDate = useMemo(() => {
    return calendar.viewrange.getDateFromRelativePosition(mousePosition?.percentageY || 0, day.date, 'floor', 1);
  }, [mousePosition, day, calendar.viewrange]);

  useEffect(() => {
    if (!element) {
      return;
    }

    const position = listenMousePosition(element);
    const subscription = position.subscribe((event) => {
      setMouseIn(event.inside);

      if (updateMousePosition) {
        setMousePosition(event);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [element, updateMousePosition, setMouseIn]);

  return [pointingDate, mouseIn, mousePosition];
};
