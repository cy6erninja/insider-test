import { WeekResultsResponse } from "../../types/league";

// Match state
export interface MatchState {
  currentWeek: number;
  weekResults?: WeekResultsResponse;
  loadingResults: boolean;
  totalWeeks?: number;
}

// Initial state
export const initialMatchState: MatchState = {
  currentWeek: 0,
  loadingResults: false,
};

// Action types
export type MatchAction =
  | { type: "SET_CURRENT_WEEK"; payload: number }
  | { type: "SET_WEEK_RESULTS"; payload: WeekResultsResponse }
  | { type: "SET_LOADING_RESULTS"; payload: boolean }
  | { type: "SET_TOTAL_WEEKS"; payload: number };

// Reducer
export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case "SET_CURRENT_WEEK":
      return { ...state, currentWeek: action.payload };
    case "SET_WEEK_RESULTS":
      return { ...state, weekResults: action.payload };
    case "SET_LOADING_RESULTS":
      return { ...state, loadingResults: action.payload };
    case "SET_TOTAL_WEEKS":
      return { ...state, totalWeeks: action.payload };
    default:
      return state;
  }
} 