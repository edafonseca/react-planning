"use client";

import { Bucket } from "@/lib/planning/slots/bucket";
import { Slot } from "@/lib/planning/slots/slot";
import { addMinutes } from "date-fns";
import {
  MouseEvent,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ModifierListener, Modifiers } from "./modifier-listener";
import { PlanningContext, context } from "./planning-context";
import { Time } from "@/lib/planning/slots/time";
import { TimeBucket } from "@/lib/planning/slots/time-bucket";
import { Day as DayLib } from "@/lib/planning/slots/day";

function getRelativePosition(rect: DOMRect, clientX: number, clientY: number) {
  const x = (clientX - rect.x) / rect.width;
  const y = (clientY - rect.y) / rect.height;

  return { x, y };
}

function minutesFromStartOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getDateFromRelativePosition(
  p: { x: number; y: number },
  from: Date = new Date(),
) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  start.setMinutes(Math.round((p.y * 60 * 24) / 15) * 15);

  return start;
}

type SlotProps = {
  slot: Slot;
  color?: string;
};

const SlotWidget: React.FC<SlotProps> = ({ slot, color }) => {
  return (
    <div
      key={slot.id}
      className="absolute"
      style={{
        top: (minutesFromStartOfDay(slot.from) / 1440) * 100 + "%",
        height:
          (minutesFromStartOfDay(slot.to) / 1440) * 100 -
          (minutesFromStartOfDay(slot.from) / 1440) * 100 +
          "%",
        width: "90%",
        background: color || "#91e3e6",
        margin: "0 5%",
        boxSizing: "border-box",
        borderRadius: "6px",
        border: "2px solid black",
        // transition: '0.1s height linear'
      }}
    >
      {slot.id}
    </div>
  );
};

const Day: React.FC = () => {
  const [interacting, setInteracting] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [creatingSlot, setCreatingSlot] = useState<Slot | null>(null);
  const [times, setTimes] = useState<Time[]>([]);
  const { modifier } = useContext(context);

  const day = useRef<DayLib>(new DayLib());
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dayRef.current) {
      return;
    }

    setRect(dayRef.current.getBoundingClientRect());
  }, []);

  const onMouseDown = () => {
    setInteracting(true);
  };

  const onMouseUp = () => {
    setInteracting(false);

    if (!creatingSlot) {
      return;
    }

    if (modifier === "shift") {
      day.current.addTime(new Time().addSlot(creatingSlot), 'cut');
    }

    if (modifier === "Shift") {
      day.current.addTime(new Time().addSlot(creatingSlot), 'cut');
    } else {
      day.current.addTime(new Time().addSlot(creatingSlot), 'interpose');
    }

    setTimes(day.current.times);
    setCreatingSlot(null);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!interacting) return;

    const p = getRelativePosition(rect, e.clientX, e.clientY);
    const date = getDateFromRelativePosition(p);

    const newSlot = creatingSlot === null
      ? new Slot(date, 30 * 60 * 1000)
      : new Slot(creatingSlot.from, date.getTime() - creatingSlot.from.getTime());

    if (null === creatingSlot || !creatingSlot.equals(newSlot)) {
      setCreatingSlot(newSlot);
    }
  };

  const s = useMemo(() => {
    const preview = new DayLib();
    day.current.times.forEach((time) => {
      const t = new Time()
      time.getSlots().forEach((slot) => t.addSlot(new Slot(slot.from, slot.duration, slot.id)));
      preview.addTime(t, 'interpose')
    });
    
    if (creatingSlot?.from && creatingSlot?.duration) {
      const newSlot = new Slot(creatingSlot.from, creatingSlot.duration);

      if (modifier === "Shift") {
        preview.addTime(new Time().addSlot(newSlot), 'cut');
      } else {
        preview.addTime(new Time().addSlot(newSlot), 'interpose');
      }
    }

    return preview.times;
  }, [creatingSlot?.from, creatingSlot?.duration, modifier]);

  console.log(times);

  return (
    <div
      className="border flex-1 relative"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      ref={dayRef}
    >
      {s.map((time) => (
        time.bucket.slots.map((slot) => (
          <SlotWidget key={time.id + '-' + slot.id + Math.random()} slot={slot} color={time.color} />
        ))
      ))}
      {creatingSlot && (
        <SlotWidget slot={creatingSlot} />
      )}
    </div>
  );
};

export const Planning: React.FC = () => {
  return (
    <PlanningContext>
      <ModifierListener />
      <div className="flex justify-content-stretch w-full h-screen">
        <Day></Day>
        <Day></Day>
        <Day></Day>
        <Day></Day>
        <Day></Day>
      </div>
    </PlanningContext>
  );
};
