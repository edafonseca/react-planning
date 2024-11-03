import { createContext, useEffect, useMemo, useState } from "react";
import { Modifiers } from "./modifier-listener";

type PlanningContextType = {
  placeholderDuration: number;
  setPlaceholderDuration: (placeholderDuration: number) => void;
  modifier: Modifiers | null;
  setModifier: (modifier: Modifiers | null) => void;
};

export const context = createContext<PlanningContextType>({
  placeholderDuration: 30 * 60 * 1000,
  setPlaceholderDuration: () => {},
  modifier: null,
  setModifier: () => {},
});

type Props = {
  children?: React.ReactNode;
};

export const PlanningContext: React.FC<Props> = ({ children }) => {
  const [placeholderDuration, setPlaceholderDuration] = useState(
    30 * 60 * 1000,
  );
  const [modifier, setModifier] = useState<Modifiers | null>(null);

  const value = useMemo(
    () => ({
      placeholderDuration,
      setPlaceholderDuration,
      modifier,
      setModifier,
    }),
    [modifier, setModifier, placeholderDuration, setPlaceholderDuration],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};
