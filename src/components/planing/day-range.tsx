import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Day } from '@/lib/planning/slots/day';
import { Slot, SlotInterface } from '@/lib/planning/slots/slot';
import { useCalendar } from './planning-provider';
import { SlotWidget } from './slot-widget';
import { format } from 'date-fns';
import { createSlotFromDates, round } from './day-range/tools';
import { useResize } from './day-range/useResize';
import { useMousePosition } from './day-range/useMousePosition';

type DayRangeProps = {
  day: Day;
  placeholder: Slot | null;
  setPlaceholder: (slot: Slot | null) => void;
};

export const DayRange: React.FC<DayRangeProps> = ({ day, placeholder }) => {
  const { calendar, mode, modifier, placeholderDuration } = useCalendar();
  const dayRef = useRef<HTMLDivElement>(null);

  const [interacting, setInteracting] = useState(false);
  const [pointingDate, mouseIn] = useMousePosition(dayRef.current, interacting, day, calendar);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [resizingSlot, startResize] = useResize(dayRef.current, calendar, day);

  const date = day.date;

  const [daySlots, setDaySlots] = useState<SlotInterface[]>([]);

  useEffect(() => {
    const subscription = day.subscribe(() => {
      setDaySlots(day.getSlots());
    });

    return () => subscription.unsubscribe();
  }, [day]);


  const insertMode = modifier === 'Shift' ? 'interpose' : 'cut';

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const placeholderSlot = placeholder;

  // Calculates interaction state.
  useEffect(() => {
    const interactiveMode = mode === 'insert';
    const isResizing = resizingSlot !== null;

    setInteracting(mouseIn && (interactiveMode || isResizing));
  }, [mode, mouseIn, resizingSlot]);


  const creatingSlot = useMemo(() => {
    if (!mouseIn) return null;
    if (mode !== 'insert') return null;

    if (null === startDate) {
      return new Slot(round(pointingDate), placeholderDuration);
    }

    const mouseHasMoved = pointingDate.getTime() - startDate.getTime() > 0;

    if (!mouseHasMoved) {
      return new Slot(round(startDate), placeholderDuration);
    }

    return createSlotFromDates(round(startDate), round(pointingDate, 'ceil'), calendar);
  }, [startDate, pointingDate, mode, mouseIn, calendar, placeholderDuration]);

  const onMouseDown = (e: MouseEvent) => {
    setStartDate(pointingDate);
  };

  const onMouseUp = (e: MouseEvent) => {
    setStartDate(null);

    if (creatingSlot) {
      day.addSlot(creatingSlot, insertMode);
    }
  };

  const s = useMemo(() => {
    const preview = new Day(calendar.viewrange, day.date);
    daySlots
      .filter((s) => s.id !== resizingSlot?.id)
      .forEach((slot) => {
        preview.addSlot(slot.clone());
      });

    if (creatingSlot) {
      preview.addSlot(creatingSlot, insertMode);
    }

    if (resizingSlot) {
      preview.addSlot(resizingSlot, insertMode);
    }

    if (placeholderSlot) {
      preview.addSlot(placeholderSlot, 'cut');
    }

    return preview.getSlots();
  }, [calendar, creatingSlot, placeholderSlot, day, daySlots, insertMode, resizingSlot]);

  return (
    <div className="relative flex-1 flex flex-col" style={{ backgroundColor: interacting ? '#B0A7FA8F' : '#00000000' }}>
      <div>{format(date, 'dd/MM/yyyy')}</div>
      <div className="border flex-1 relative" onMouseDown={onMouseDown} onMouseUp={onMouseUp} ref={dayRef}>
        {s.length}
        {s.map((slot) => (
          <SlotWidget
            key={slot.id + Math.random()}
            calendar={calendar}
            slot={slot}
            selected={selectedSlot?.id === slot.id}
            onSelect={setSelectedSlot}
            color="#B0A7FA8F"
            onResizeStart={(position) => startResize(slot, position)}
          />
        ))}
        {creatingSlot && <SlotWidget calendar={calendar} slot={creatingSlot} />}
        {resizingSlot && <SlotWidget calendar={calendar} slot={resizingSlot} />}
      </div>
    </div>
  );
};
