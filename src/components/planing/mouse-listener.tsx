import { useContext, useEffect } from "react";
import { context } from "./planning-provider";

export const MouseListener: React.FC = () => {
  const { setMouseState } = useContext(context);

  useEffect(() => {
    const onMouseUp = (e: MouseEvent) => {
      setMouseState("up");
    };

    document.addEventListener("mouseup", onMouseUp);

    return () => document.removeEventListener("mouseup", onMouseUp);
  });

  return null;
};
