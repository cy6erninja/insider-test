import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  LeagueTableResponse,
  WeekResultsResponse,
  Prediction,
} from "../types/league";

// State type
interface LeagueState {
  currentWeek: number;
  leagueTable?: LeagueTableResponse;
  loadingTable: boolean;
  weekResults?: WeekResultsResponse;
  loadingResults: boolean;
  predictions?: { data: Prediction[] };
  loadingPredictions: boolean;
  totalWeeks?: number;
}

// Initial state
const initialState: LeagueState = {
  currentWeek: 0,
  loadingTable: false,
  loadingResults: false,
  loadingPredictions: false,
};

// Action types
type LeagueAction =
  | { type: "SET_CURRENT_WEEK"; payload: number }
  | { type: "SET_LEAGUE_TABLE"; payload: LeagueTableResponse }
  | { type: "SET_LOADING_TABLE"; payload: boolean }
  | { type: "SET_WEEK_RESULTS"; payload: WeekResultsResponse }
  | { type: "SET_LOADING_RESULTS"; payload: boolean }
  | { type: "SET_PREDICTIONS"; payload: { data: Prediction[] } }
  | { type: "SET_LOADING_PREDICTIONS"; payload: boolean }
  | { type: "SET_TOTAL_WEEKS"; payload: number }
  | { type: "RESET_STATE" };

// Reducer function
function leagueReducer(state: LeagueState, action: LeagueAction): LeagueState {
  switch (action.type) {
    case "SET_CURRENT_WEEK":
      return { ...state, currentWeek: action.payload };
    case "SET_LEAGUE_TABLE":
      return { ...state, leagueTable: action.payload };
    case "SET_LOADING_TABLE":
      return { ...state, loadingTable: action.payload };
    case "SET_WEEK_RESULTS":
      return { ...state, weekResults: action.payload };
    case "SET_LOADING_RESULTS":
      return { ...state, loadingResults: action.payload };
    case "SET_PREDICTIONS":
      return { ...state, predictions: action.payload };
    case "SET_LOADING_PREDICTIONS":
      return { ...state, loadingPredictions: action.payload };
    case "SET_TOTAL_WEEKS":
      return { ...state, totalWeeks: action.payload };
    case "RESET_STATE":
      return { ...initialState };
    default:
      return state;
  }
}

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
