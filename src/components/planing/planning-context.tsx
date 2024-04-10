import { createContext, useMemo, useState } from "react";
import { Modifiers } from "./modifier-listener";

type PlanningContextType = {
  modifier: Modifiers | null;
  setModifier: (modifier: Modifiers | null) => void;
};

export const context = createContext<PlanningContextType>({
  modifier: null,
  setModifier: () => {},
});

type Props = {
  children?: React.ReactNode
};

export const PlanningContext: React.FC<Props> = ({ children }) => {
  const [modifier, setModifier] = useState<Modifiers | null>(null);

  const value = useMemo(
    () => ({
      modifier,
      setModifier
    }),
    [modifier, setModifier],
  );


  return <context.Provider value={value}>{children}</context.Provider>;
};
