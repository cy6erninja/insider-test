import { LeagueTableResponse } from "../../types/league";

// Table state
export interface TableState {
  leagueTable?: LeagueTableResponse;
  loadingTable: boolean;
}

// Initial state
export const initialTableState: TableState = {
  loadingTable: false,
};

// Action types
export type TableAction =
  | { type: "SET_LEAGUE_TABLE"; payload: LeagueTableResponse }
  | { type: "SET_LOADING_TABLE"; payload: boolean };

// Reducer
export function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "SET_LEAGUE_TABLE":
      return { ...state, leagueTable: action.payload };
    case "SET_LOADING_TABLE":
      return { ...state, loadingTable: action.payload };
    default:
      return state;
  }
} 