import { useContext, useEffect } from "react";
import { context, useCalendar } from "./planning-provider";

export type Modifiers = "Shift" | "Ctrl" | "Alt";

function isModifier(e: KeyboardEvent) {
  return ["Shift", "Ctrl", "Alt", "Meta"].includes(e.key);
}

export const ModifierListener: React.FC = () => {
  const { calendar } = useCalendar();

  const { setModifier, placeholderDuration, setPlaceholderDuration } = useContext(context);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isModifier(e)) {
        setModifier(e.key as Modifiers);
      }

      if (e.key === "a") {
        const duration = placeholderDuration * 2;
        setPlaceholderDuration(Math.min(duration, 8 * 60 * 60 * 1000));
      }
      if (e.key === "d") {
        const duration = placeholderDuration / 2;
        setPlaceholderDuration(Math.max(duration, 30 * 60 * 1000));
      }

      if (e.key === 'i') {
        calendar.setMode('insert');
      }

      if (e.key === 'Escape') {
        calendar.setMode('normal');
      }

      [1, 2, 3, 4, 5, 6, 7, 8].forEach((key) => {
        if (e.key.toString() === key.toString()) {
          setPlaceholderDuration(key * 60 * 60 * 1000);
        }
      })
        
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (isModifier(e)) {
        setModifier(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [setModifier, placeholderDuration, setPlaceholderDuration]);

  return null;
};
