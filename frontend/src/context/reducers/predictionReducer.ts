import { Prediction } from "../../types/league";

// Prediction state
export interface PredictionState {
  predictions?: { data: Prediction[] };
  loadingPredictions: boolean;
}

// Initial state
export const initialPredictionState: PredictionState = {
  loadingPredictions: false,
};

// Action types
export type PredictionAction =
  | { type: "SET_PREDICTIONS"; payload: { data: Prediction[] } }
  | { type: "SET_LOADING_PREDICTIONS"; payload: boolean };

// Reducer
export function predictionReducer(
  state: PredictionState,
  action: PredictionAction
): PredictionState {
  switch (action.type) {
    case "SET_PREDICTIONS":
      return { ...state, predictions: action.payload };
    case "SET_LOADING_PREDICTIONS":
      return { ...state, loadingPredictions: action.payload };
    default:
      return state;
  }
} 