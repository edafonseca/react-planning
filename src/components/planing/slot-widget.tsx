import { Calendar } from "@/lib/planning/calendar";
import { Slot } from "@/lib/planning/slots/slot";
import { format } from "date-fns";
import { CSSProperties, forwardRef, useState } from "react";

type SlotProps = {
  calendar: Calendar;
  slot: Slot;
  selected?: boolean;
  onSelect?: (slot: Slot) => void;
  onResizeStart?: (position: 'top' | 'bottom') => void;
  onResizeStop?: () => void;
  color?: string;
};

export const SlotWidget: React.FC<SlotProps> = ({
  calendar,
  slot,
  color,
  selected,
  onSelect,
  onResizeStart,
  onResizeStop,
}) => {
  if (!calendar.viewrange.isInViewRange(slot.from)) {
    return null;
  }

  const from = calendar.viewrange.getRelativePosition(slot.from, slot.from);
  const to = calendar.viewrange.getRelativePosition(
    calendar.viewrange.getTo(slot),
    slot.from
  );

  const startResizingFromTop = (e: React.MouseEvent) => {
    onResizeStart && onResizeStart("top");
  };

  const startResizingFromBottom = (e: React.MouseEvent) => {
    onResizeStart && onResizeStart("bottom");
  };

  const stopResizing = (e: React.MouseEvent) => {
    onResizeStop && onResizeStop();
  };

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
          position: "relative",
          background: color || "#FFD8C7",
          borderRadius: "8px",
          margin: "4px 8px",
          padding: "8px",
          overflow: "hidden",
          flex: 1,
          border: selected ? "2px solid red" : "none",
        }}
      >
        <DragBar top onMouseDown={startResizingFromTop} onMouseUp={stopResizing} />
        <DragBar bottom onMouseDown={startResizingFromBottom} onMouseUp={stopResizing} />
        <div style={{ fontWeight: "bold" }}>{slot.id}</div>
        <div>
          {format(slot.from, "HH:mm")} -> {format(calendar.viewrange.getTo(slot), "HH:mm")} ({slot.duration / 1000 / 60}m)
        </div>
      </div>
    </div>
  );
};


type DragBarProps = {
  top?: boolean;
  bottom?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const DragBar: React.FC<DragBarProps> =({ top, bottom, ...rest }) => {
  const style: CSSProperties = {
    position: "absolute",
    inset: 'calc(100% - 6px - 8px) 20%',
    height: '8px',
    background: "#efefef",
    borderRadius: '8px',
    cursor: "row-resize",
  };

  top && (style.top = '8px');
  bottom && (style.bottom = '8px');

  return <div style={style} {...rest}></div>

}
