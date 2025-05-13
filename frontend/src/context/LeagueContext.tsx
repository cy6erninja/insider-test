import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  LeagueState,
  LeagueAction,
  initialState,
  leagueReducer,
} from "./reducers";

// Create context
type LeagueContextType = {
  state: LeagueState;
  dispatch: React.Dispatch<LeagueAction>;
};

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

// Context provider
interface LeagueProviderProps {
  children: ReactNode;
}

export function LeagueProvider({ children }: LeagueProviderProps) {
  const [state, dispatch] = useReducer(leagueReducer, initialState);

  return (
    <LeagueContext.Provider value={{ state, dispatch }}>
      {children}
    </LeagueContext.Provider>
  );
}

// Custom hook for using the context
export function useLeague() {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error("useLeague must be used within a LeagueProvider");
  }
  return context;
}
