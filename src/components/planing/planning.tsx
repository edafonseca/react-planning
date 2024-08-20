"use client";

import { Slot } from "@/lib/planning/slots/slot";
import {
  MouseEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ModifierListener, Modifiers } from "./modifier-listener";
import { PlanningContext, context } from "./planning-context";
import { Day as DayLib } from "@/lib/planning/slots/day";
import { Calendar } from "@/lib/planning/calendar";

function getRelativePosition(rect: DOMRect, clientX: number, clientY: number) {
  const x = (clientX - rect.x) / rect.width;
  const y = (clientY - rect.y) / rect.height;

  return { x, y };
}

function minutesFromStartOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

type SlotProps = {
  slot: Slot;
  selected?: boolean;
  onSelect?: (slot: Slot) => void;
  color?: string;
};

const SlotWidget: React.FC<SlotProps> = ({
  slot,
  color,
  selected,
  onSelect,
}) => {
  if (!calendar.viewrange.isInViewRange(slot.from)) {
    return null;
  }

  const from = calendar.viewrange.getRelativePosition(slot.from);
  const to = calendar.viewrange.getRelativePosition(calendar.viewrange.getTo(slot));

  return (
    <div
      onClick={(e) => onSelect && onSelect(slot)}
      // onMouseDown={(e) => e.stopPropagation()}
      className="absolute"
      style={{
        top: from * 100 + "%",
        height:
          ((to - from) * 100) + "%",
        width: "90%",
        background: color || "#91e3e6",
        margin: "0 5%",
        boxSizing: "border-box",
        borderRadius: "6px",
        border: `2px solid ${selected ? "red" : "black"}`,
      }}
    >
      {slot.id}
        <br />
      <div>{slot.from.toLocaleTimeString()}</div>
      <div>{calendar.viewrange.getTo(slot).toLocaleTimeString()}</div>
      <div>{slot.duration / 1000 / 60}</div>
    </div>
  );
};


const calendar = new Calendar();

const Day: React.FC = () => {
  const [interacting, setInteracting] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [creatingSlot, setCreatingSlot] = useState<Slot | null>(null);
  const [placeholderSlot, setPlaceholderSlot] = useState<Slot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [hovering, setHovering] = useState(false);
  const { modifier } = useContext(context);

  const day = useRef<DayLib>(new DayLib(calendar.viewrange));
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dayRef.current) {
      return;
    }

    setRect(dayRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (false === hovering) {
      console.log("stop hovering");
      setPlaceholderSlot(null);
    }
  }, [hovering]);

  useEffect(() => {
    if (true === interacting) {
      setHovering(false);
    }
  }, [interacting]);

  const onMouseDown = (e: MouseEvent) => {
    setInteracting(true);

    const p = getRelativePosition(rect, e.clientX, e.clientY);
    const date = calendar.viewrange.getDateFromRelativePosition(p.y);
    setStartDate(date);
    handleInteractionOnMouseMouve(date);

    return true;
  };

  const onMouseEnter = (e: MouseEvent) => {
    setHovering(true);
  };

  const onMouseLeave = (e: MouseEvent) => {
    setHovering(false);
  };

  const onMouseUp = () => {
    setInteracting(false);

    if (!creatingSlot) {
      return;
    }

    const diff = [];
    if (modifier === "Shift") {
      diff.push(...day.current.addSlot(creatingSlot, "interpose").all());
    } else {
      diff.push(...day.current.addSlot(creatingSlot, "cut").all());
    }

    // console.log(diff);

    setCreatingSlot(null);

    return true;
  };

  const onMouseMove = (e: MouseEvent) => {
    const p = getRelativePosition(rect, e.clientX, e.clientY);
    const date = calendar.viewrange.getDateFromRelativePosition(p.y);

    interacting && startDate && handleInteractionOnMouseMouve(date);
    handleHoveringOnMouseMouve(date);
  };

  const handleInteractionOnMouseMouve = (date: Date) => {
    if (null === creatingSlot) {
      setCreatingSlot(new Slot(date, 30 * 60 * 1000));
    } else {
      const from = date < startDate ? date : creatingSlot.from;
      const to = date > startDate ? date : calendar.viewrange.getTo(creatingSlot);

      if (
        from.getTime() !== creatingSlot.from.getTime() ||
        to.getTime() !== calendar.viewrange.getTo(creatingSlot).getTime()
      ) {
        // setCreatingSlot(new Slot(from, to.getTime() - from.getTime()));
        setCreatingSlot(new Slot(from, calendar.viewrange.getDurationBetween(from, to)));
      }
    }

    return true;
  };

  const handleHoveringOnMouseMouve = (date: Date) => {
    if (interacting) return;

    const slot = new Slot(date, 60 * 60 * 1000);

    // if (day.current.bucket.getOverlaping(slot).length > 0) {
    //   setPlaceholderSlot(null);
    //
    //   return;
    // }

    setPlaceholderSlot(slot);
  };

  const select = (slot: Slot) => {
    // console.log(slot);
    setSelectedSlot(slot);
  };

  const s = useMemo(() => {
    const preview = new DayLib(calendar.viewrange);
    day.current.getSlots().forEach((slot) => {
      preview.addSlot(slot.clone());
    });

    if (creatingSlot?.from && creatingSlot?.duration) {
      const newSlot = creatingSlot.clone();

      if (modifier === "Shift") {
        preview.addSlot(newSlot, "interpose");
      } else {
        preview.addSlot(newSlot, "cut");
      }
    }

    if (placeholderSlot) {
      // preview.addSlot(placeholderSlot, "cut");
    }

    return preview.getSlots();
  }, [creatingSlot, placeholderSlot, modifier]);

  return (
    <div
      className="border flex-1 relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      ref={dayRef}
    >
      {s.length}
      {s.map((slot) => (
        <SlotWidget
          key={slot.id + Math.random()}
          slot={slot}
          selected={selectedSlot?.id === slot.id}
          onSelect={select}
        />
      ))}
      {creatingSlot && <SlotWidget slot={creatingSlot} />}
      {false && placeholderSlot && (
        <div
          className="absolute"
          style={{
            top:
              (minutesFromStartOfDay(placeholderSlot.from) / 1440) * 100 + "%",
            height:
              (minutesFromStartOfDay(calendar.viewrange.getTo(placeholderSlot)) / 1440) * 100 -
              (minutesFromStartOfDay(placeholderSlot.from) / 1440) * 100 +
              "%",
            width: "90%",
            background: "#f1f1f1",
            margin: "0 5%",
            boxSizing: "border-box",
            borderRadius: "6px",
            border: `2px dashed #e4e4e4`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>+</span>
        </div>
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
