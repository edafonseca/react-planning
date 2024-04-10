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


const Day: React.FC = () => {
  const [interacting, setInteracting] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [creatingSlot, setCreatingSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [previewSlots, setPreviewSlots] = useState<Slot[]>([]);
  const { modifier } = useContext(context);

  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dayRef.current) {
      return;
    }

    setRect(dayRef.current.getBoundingClientRect());
  }, []);

  const onMouseDown = (e: MouseEvent) => {
    setInteracting(true);
  };

  const onMouseUp = (e: MouseEvent) => {
    setInteracting(false);

    if (!creatingSlot) {
      return;
    }

    const bucket = new Bucket(slots);
    if (modifier === "Shift") {
      bucket.cut(creatingSlot);
    } else {
      bucket.interpose(creatingSlot);
    }

    setSlots(bucket.slots);
    setCreatingSlot(null);
    setPreviewSlots([]);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!interacting) return;

    const p = getRelativePosition(rect, e.clientX, e.clientY);
    const date = getDateFromRelativePosition(p);

    const newSlot =
      null === creatingSlot
        ? new Slot(date, 30 * 60 * 1000)
        : new Slot(
            creatingSlot.from,
            date.getTime() - creatingSlot.from.getTime(),
          );

    if (null === creatingSlot || !newSlot.equals(creatingSlot)) {
      setCreatingSlot(newSlot);
    }
  };

  const s = useMemo(() => {
    const bucket = new Bucket(slots);
    if (creatingSlot) {
      if (modifier === "Shift") {
        bucket.cut(creatingSlot);
      } else {
        bucket.interpose(creatingSlot);
      }
    }

    return bucket.slots;
  }, [slots, creatingSlot, modifier]);

  return (
    <div
      className="border flex-1 relative"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      ref={dayRef}
    >
      {s.map((slot) => (
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
            background: "#91e3e6",
            margin: "0 5%",
            boxSizing: "border-box",
            borderRadius: "6px",
            border: "2px solid black",
            // transition: '0.1s height linear'
          }}
        ></div>
      ))}
      {creatingSlot && (
        <div
          key={creatingSlot.id}
          className="absolute"
          style={{
            top: (minutesFromStartOfDay(creatingSlot.from) / 1440) * 100 + "%",
            height:
              (minutesFromStartOfDay(creatingSlot.to) / 1440) * 100 -
              (minutesFromStartOfDay(creatingSlot.from) / 1440) * 100 +
              "%",
            width: "90%",
            background: "#d7d7d7",
            margin: "0 5%",
            boxSizing: "border-box",
            borderRadius: "6px",
            border: "2px dotted black",
            opacity: 0.5,
          }}
        ></div>
      )}
    </div>
  );
};



export const Planning: React.FC = () => {
  return (
    <PlanningContext>
      <ModifierListener />
      <div className="flex justify-content-stretch w-1/2 h-screen">
        <Day></Day>
        <Day></Day>
      </div>
    </PlanningContext>
  );
};
