import { useContext, useEffect } from "react";
import { context } from "./planning-context";

export type Modifiers = "Shift" | "Ctrl" | "Alt";

function isModifier(e: KeyboardEvent) {
  return ["Shift", "Ctrl", "Alt", "Meta"].includes(e.key);
}

export const ModifierListener: React.FC = () => {
  const { setModifier } = useContext(context);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isModifier(e)) {
        setModifier(e.key as Modifiers);
      }
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
  }, [setModifier]);

  return null;
};
