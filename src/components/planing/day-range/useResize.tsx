import { Calendar } from "@/lib/planning/calendar";
import { Day } from "@/lib/planning/slots/day";
import { Slot, SlotInterface } from "@/lib/planning/slots/slot";
import { listenMouseState, MouseState } from "@/lib/planning/tools/mouse-position";
import { useEffect, useMemo, useRef, useState } from "react";
import { createSlotFromDates, round } from "./tools";
import { useMousePosition } from "./useMousePosition";

export const useResize = (element: HTMLDivElement|null, calendar: Calendar, day: Day): [Slot | null, (slot: SlotInterface, position: 'top'|'bottom') => {}]  => {
  const [slot, setSlot] = useState<SlotInterface | null>(null);
  const [pointingDate, _] = useMousePosition(element, true, day, calendar);
  const resizing = useRef<{ slot: SlotInterface; initialSlot: SlotInterface; position: 'top' | 'bottom'; startDate?: Date } | null>(null);

  const resizingSlot = useMemo(() => {
    if (!resizing.current) return null;

    if (!resizing.current.startDate) {
      resizing.current.startDate = pointingDate;
    }

    const { startDate, slot, position } = resizing.current;

    if (position === 'top') {
      const from = pointingDate.getTime() - (startDate.getTime() - slot.from.getTime());

      return createSlotFromDates(round(new Date(from)), round(slot.to), calendar, slot.id);
    }

    if (position === 'bottom') {
      const to = pointingDate.getTime() + (slot.to.getTime() - startDate.getTime());

      return createSlotFromDates(round(slot.from), round(new Date(to)), calendar, slot.id);
    }

    return null;
  }, [pointingDate, calendar]);

  useEffect(() => {
    if (!element) return;

    const mouseState = listenMouseState();
    const mouseStateSubscription = mouseState.subscribe((state: MouseState) => {
      if (state === 'up') {
        if (!resizingSlot || !slot) return;

        day.removeSlot(slot);
        day.addSlot(resizingSlot, 'cut');
        setSlot(null);
        resizing.current = null;
      }
    });

    return () => {
        mouseStateSubscription.unsubscribe();
    };
  }, [element, slot, day, resizingSlot]);

  const start = (slot: SlotInterface, position: 'top' | 'bottom'): void => {
    resizing.current = { slot, initialSlot: slot.clone(), position };
    setSlot(slot);
  };  

  return [resizingSlot, start];
};
