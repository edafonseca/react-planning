import { createContext, Dispatch, useContext, useReducer } from "react";

export const PlanningContext = createContext<PlanningState>({} as PlanningState);
export const PlanningDispatchContext = createContext<Dispatch<PlanningAction>>({} as Dispatch<PlanningAction>);

export enum PlanningActionType {
  setMode = 'set_mode',
}

type PlanningAction = {
  type: PlanningActionType;
  payload: string;
}

type PlanningState = {
  mode: string;
};

type Props = {
  children?: React.ReactNode;
}

export const PlanningProvider: React.FC<Props> = ({ children }) => {
  const [planning, dispatch] = useReducer(planningReducer, initialState);

  return (
    <PlanningContext.Provider value={planning}>
      <PlanningDispatchContext.Provider value={dispatch}>
        {children}
      </PlanningDispatchContext.Provider> 
    </PlanningContext.Provider>
  )
};

function planningReducer(state: PlanningState, action: PlanningAction) { 
  switch (action.type) {
    case PlanningActionType.setMode:
      return { ...state, mode: action.payload };
  }

};

const initialState = { 
  mode: 'normal',
};

export const usePlanning = () => useContext(PlanningContext);
export const usePlanningDispatch = () => useContext(PlanningDispatchContext);

