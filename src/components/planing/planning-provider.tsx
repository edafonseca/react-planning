import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Modifiers } from "./modifier-listener";
import { Calendar } from "@/lib/planning/calendar";
import { addDays } from "date-fns";

type Mode = "normal" | "insert";

type PlanningContextType = {
  calendar: Calendar;
  mode: Mode;
  placeholderDuration: number;
  setPlaceholderDuration: (placeholderDuration: number) => void;
  modifier: Modifiers | null;
  setModifier: (modifier: Modifiers | null) => void;
  mouseState: "up" | "down";
  setMouseState: (mouseState: "up" | "down") => void;
  onMouseUp: (callback: () => void) => void;
};

export const context = createContext<PlanningContextType>(
  {} as PlanningContextType,
);

type Props = {
  children?: React.ReactNode;
};

const calendar = new Calendar();
for (let i = 0; i < 5; i++) {
  calendar.addDay(addDays(new Date(), i));
}

export const PlanningProvider: React.FC<Props> = ({ children }) => {
  const [updated, setForceUpdate] = useState({});

  useEffect(() => {
    const subscription = calendar.subscribe(() => {
      console.log('calendar updated');
      setForceUpdate({});
    });

    return () => subscription.unsubscribe();
  }, []);


  const [placeholderDuration, setPlaceholderDuration] = useState(
    30 * 60 * 1000,
  );
  const mouseUpCallbacks = useRef<Array<() => void>>([]);
  const [mouseState, setMouseState] = useState<"up" | "down">("up");
  const [modifier, setModifier] = useState<Modifiers | null>(null);

  useEffect(() => {
    if (mouseState === "up") {
      mouseUpCallbacks.current.forEach((callback) => callback());
    }
  }, [mouseState]);

  const onMouseUp = (callback: () => void) => {
    mouseUpCallbacks.current.push(callback);
  };

  const value = useMemo(
    () => ({
      calendar,
      mode: calendar.getMode(),
      placeholderDuration,
      setPlaceholderDuration,
      modifier,
      setModifier,
      mouseState,
      setMouseState,
      onMouseUp,
    }),
    [
      updated,
      modifier,
      setModifier,
      placeholderDuration,
      setPlaceholderDuration,
      mouseState,
      setMouseState,
    ],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useCalendar = (): PlanningContextType => {
  return useContext(context);
};
