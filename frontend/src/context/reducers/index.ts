import { TableAction, TableState, initialTableState, tableReducer } from './tableReducer';
import { MatchAction, MatchState, initialMatchState, matchReducer } from './matchReducer';
import { PredictionAction, PredictionState, initialPredictionState, predictionReducer } from './predictionReducer';

// Combined state
export interface LeagueState extends TableState, MatchState, PredictionState {}

// Combined initial state
export const initialState: LeagueState = {
  ...initialTableState,
  ...initialMatchState,
  ...initialPredictionState,
};

// Combined action types
export type LeagueAction = TableAction | MatchAction | PredictionAction | { type: "RESET_STATE" };

// Root reducer
export function leagueReducer(state: LeagueState, action: LeagueAction): LeagueState {
  if (action.type === "RESET_STATE") {
    return initialState;
  }

  // Determine which sub-reducer to use based on action type
  if (
    action.type === "SET_LEAGUE_TABLE" ||
    action.type === "SET_LOADING_TABLE"
  ) {
    return {
      ...state,
      ...tableReducer(state, action),
    };
  } else if (
    action.type === "SET_CURRENT_WEEK" ||
    action.type === "SET_WEEK_RESULTS" ||
    action.type === "SET_LOADING_RESULTS" ||
    action.type === "SET_TOTAL_WEEKS"
  ) {
    return {
      ...state,
      ...matchReducer(state, action),
    };
  } else if (
    action.type === "SET_PREDICTIONS" ||
    action.type === "SET_LOADING_PREDICTIONS"
  ) {
    return {
      ...state,
      ...predictionReducer(state, action),
    };
  }

  return state;
} 