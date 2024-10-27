import { createContext, useEffect, useMemo, useState } from "react";
import { Modifiers } from "./modifier-listener";
import { Slot } from "@/lib/planning/slots/slot";

type PlanningContextType = {
  placeholderSlot?: Slot,
  setPlaceholderSlot: (slot: Slot | null) => void,
  placeholderDuration: number;
  setPlaceholderDuration: (placeholderDuration: number) => void;
  modifier: Modifiers | null;
  setModifier: (modifier: Modifiers | null) => void;
};

export const context = createContext<PlanningContextType>({
  setPlaceholderSlot: (slot: Slot) => null,
  placeholderDuration: 30 * 60 * 1000,
  setPlaceholderDuration: () => {},
  modifier: null,
  setModifier: () => {},
});

type Props = {
  children?: React.ReactNode
};

export const PlanningContext: React.FC<Props> = ({ children }) => {
  const [placeholderSlot, setPlaceholderSlot] = useState<Slot | null>(null);
  const [placeholderDuration, setPlaceholderDuration] = useState(30 * 60 * 1000);
  const [modifier, setModifier] = useState<Modifiers | null>(null);

  useEffect(() => {
    if (placeholderSlot) {
      setPlaceholderSlot(new Slot(placeholderSlot.from, placeholderDuration));
    }
  }, [placeholderDuration]);

  const value = useMemo(
    () => ({
      placeholderSlot, 
      setPlaceholderSlot,
      placeholderDuration,
      setPlaceholderDuration,
      modifier,
      setModifier
    }),
    [modifier, setModifier, placeholderDuration, setPlaceholderDuration, placeholderSlot, setPlaceholderSlot],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};
