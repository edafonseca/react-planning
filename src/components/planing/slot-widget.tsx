import { Calendar } from "@/lib/planning/calendar";
import { Slot } from "@/lib/planning/slots/slot";
import { format } from "date-fns";

type SlotProps = {
  calendar: Calendar;
  slot: Slot;
  selected?: boolean;
  onSelect?: (slot: Slot) => void;
  color?: string;
};

export const SlotWidget: React.FC<SlotProps> = ({
  calendar,
  slot,
  color,
  selected,
  onSelect,
}) => {
  if (!calendar.viewrange.isInViewRange(slot.from)) {
    return null;
  }

  const from = calendar.viewrange.getRelativePosition(slot.from, slot.from);
  const to = calendar.viewrange.getRelativePosition(
    calendar.viewrange.getTo(slot),
    slot.from
  );

  return (
    <div
      onClick={(e) => onSelect && onSelect(slot)}
      // onMouseDown={(e) => e.stopPropagation()}
      className="absolute"
      style={{
        top: from * 100 + "%",
        height: (to - from) * 100 + "%",
        // width: "100%",
        left: 0,
        right: 0,
        // boxSizing: "border-box",
        fontSize: "12px",
        // fontFamily: "Lexend",
        display: "flex",
      }}
    >
      <div
        style={{
          background: color || "#FFD8C7",
          borderRadius: "8px",
          margin: "4px 8px",
          padding: "8px",
          overflow: "hidden",
          flex: 1,
        }}
      >
        <div style={{ fontWeight: "bold" }}>{slot.id}</div>
        <div>
          {format(slot.from, "HH:mm")} -> {format(calendar.viewrange.getTo(slot), "HH:mm")} ({slot.duration / 1000 / 60}m)
        </div>
      </div>
    </div>
  );
};
