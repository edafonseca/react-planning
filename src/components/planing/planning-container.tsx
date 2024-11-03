import { Slot } from "@/lib/planning/slots/slot";
import React, { useState } from "react";

type ChildProps = {
  placeholder?: Slot;
  setPlaceholder?: (slot?: Slot) => void;
};

type Props = {
  children: React.ReactElement<ChildProps>[];
};

export const PlanningContainer: React.FC<Props> = ({ children }) => {
  const [placeholderSlot, setPlaceholderSlot] = useState<Slot>();
  const [placeholderKey, setPlaceholderKey] = useState<string | null>();

  const setPlaceholder = (childKey: string | null, slot?: Slot) => {
    setPlaceholderSlot(slot);
    setPlaceholderKey(childKey);
  }

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const props: ChildProps = {
        setPlaceholder: (slot?: Slot) => setPlaceholder(child.key, slot),
      };

      if (placeholderKey === child.key) {
        props.placeholder = placeholderSlot;
      }

      return React.cloneElement(child, {
        ...props,
        ...child.props,
      });
    }
  });

  return <>{enhancedChildren}</>;
};
