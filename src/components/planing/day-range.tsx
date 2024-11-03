import {
  MouseEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Day } from "@/lib/planning/slots/day";
import { Slot } from "@/lib/planning/slots/slot";
import { context } from "./planning-context";
import { Calendar } from "@/lib/planning/calendar";
import { SlotWidget } from "./slot-widget";
import { format } from "date-fns";

function getRelativePosition(rect: DOMRect, clientX: number, clientY: number) {
  const x = (clientX - rect.x) / rect.width;
  const y = (clientY - rect.y) / rect.height;

  return { x, y };
}

type DayRangeProps = {
  calendar: Calendar;
  date: Date;
};

export const DayRange: React.FC<DayRangeProps> = ({
  calendar,
  date,
  placeholder,
  setPlaceholder,
}) => {
  const [interacting, setInteracting] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [creatingSlot, setCreatingSlot] = useState<Slot | null>(null);
  const [] = useState<Slot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [hovering, setHovering] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<any>({ x: 0, y: 0 });
  const { modifier, placeholderDuration } = useContext(context);

  const placeholderSlot = placeholder;
  const setPlaceholderSlot = setPlaceholder;

  const day = useRef<Day>(new Day(calendar.viewrange));
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dayRef.current) {
      return;
    }

    setRect(dayRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (false === hovering) {
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
    const pointingDate = calendar.viewrange.getDateFromRelativePosition(
      p.y,
      date,
      "floor",
      30,
    );
    setStartDate(pointingDate);
    handleInteractionOnMouseMouve(pointingDate);

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

    setCreatingSlot(null);

    return true;
  };

  const getPointingDate = () => {
    return calendar.viewrange.getDateFromRelativePosition(
      cursorPosition.y,
      date,
      creatingSlot ? "ceil" : "floor",
      Math.min(30, placeholderDuration / 1000 / 60),
    );
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!rect) return;

    const p = getRelativePosition(rect, e.clientX, e.clientY);
    setCursorPosition(p);

    const pointingDate = getPointingDate();

    interacting && startDate && handleInteractionOnMouseMouve(pointingDate);
    handleHoveringOnMouseMouve(pointingDate);
  };

  const handleInteractionOnMouseMouve = (date: Date) => {
    if (null === startDate) {
      return;
    }

    if (null === creatingSlot) {
      if (placeholderSlot) {
        setCreatingSlot(placeholderSlot.clone());
      } else {
        setCreatingSlot(new Slot(date, placeholderDuration));
      }
    } else {
      const from = date < startDate ? date : creatingSlot.from;
      const to =
        date > startDate ? date : calendar.viewrange.getTo(creatingSlot);

      if (
        from.getTime() !== creatingSlot.from.getTime() ||
        to.getTime() !== calendar.viewrange.getTo(creatingSlot).getTime()
      ) {
        setCreatingSlot(
          new Slot(from, calendar.viewrange.getDurationBetween(from, to)),
        );
      }
    }

    return true;
  };

  const handleHoveringOnMouseMouve = (date: Date) => {
    if (interacting) return;

    const slot = new Slot(date, placeholderDuration);

    setPlaceholderSlot(slot);
  };

  const select = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const s = useMemo(() => {
    const preview = new Day(calendar.viewrange);
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
      preview.addSlot(placeholderSlot, "cut");
    }

    return preview.getSlots();
  }, [calendar, creatingSlot, placeholderSlot, modifier]);

  return (
    <div className="relative flex-1 flex flex-col">
      <div>{format(date, "dd/MM/yyyy")}</div>
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
            calendar={calendar}
            slot={slot}
            selected={selectedSlot?.id === slot.id}
            onSelect={select}
            color="#B0A7FA8F"
          />
        ))}
        {creatingSlot && <SlotWidget calendar={calendar} slot={creatingSlot} />}
        {/*false && placeholderSlot && (
          <div
            className="absolute"
            style={{
              top:
                (minutesFromStartOfDay(placeholderSlot.from) / 1440) * 100 + "%",
              height:
                (minutesFromStartOfDay(
                  calendar.viewrange.getTo(placeholderSlot),
                ) /
                  1440) *
                  100 -
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
        )*/}
      </div>
    </div>
  );
};
