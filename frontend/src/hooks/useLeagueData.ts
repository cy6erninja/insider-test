import { useQuery } from "@tanstack/react-query";
import {
  fetchLeagueTable,
  fetchWeekResults,
  fetchWeekPredictions,
  fetchTotalWeeks,
} from "@/services/leagueApi";
import React from "react";
import { useLeague } from "@/context/LeagueContext";

/**
 * Hook for fetching league data and updating context
 */
export const useLeagueData = () => {
  const { state, dispatch } = useLeague();
  const { currentWeek } = state;

  // League table query
  const leagueTableQuery = useQuery({
    queryKey: ["leagueTable"],
    queryFn: fetchLeagueTable,
  });

  // Update state when data changes
  React.useEffect(() => {
    if (leagueTableQuery.data) {
      dispatch({ type: "SET_LEAGUE_TABLE", payload: leagueTableQuery.data });
    }
    dispatch({
      type: "SET_LOADING_TABLE",
      payload: leagueTableQuery.isLoading,
    });
  }, [leagueTableQuery.data, leagueTableQuery.isLoading, dispatch]);

  // Total weeks query
  const totalWeeksQuery = useQuery({
    queryKey: ["totalWeeks"],
    queryFn: fetchTotalWeeks,
  });

  React.useEffect(() => {
    if (totalWeeksQuery.data) {
      dispatch({ type: "SET_TOTAL_WEEKS", payload: totalWeeksQuery.data });
    }
  }, [totalWeeksQuery.data, dispatch]);

  // Week results query
  const weekResultsQuery = useQuery({
    queryKey: ["weekResults", currentWeek],
    queryFn: () =>
      currentWeek > 0
        ? fetchWeekResults(currentWeek)
        : Promise.resolve({ data: [] }),
    enabled: currentWeek > 0,
  });

  React.useEffect(() => {
    if (weekResultsQuery.data) {
      dispatch({ type: "SET_WEEK_RESULTS", payload: weekResultsQuery.data });
    }
    dispatch({
      type: "SET_LOADING_RESULTS",
      payload: weekResultsQuery.isLoading,
    });
  }, [weekResultsQuery.data, weekResultsQuery.isLoading, dispatch]);

  // Predictions query
  const predictionsQuery = useQuery({
    queryKey: ["weekPredictions", currentWeek],
    queryFn: () => fetchWeekPredictions(currentWeek),
    enabled: state.totalWeeks !== undefined,
  });

  React.useEffect(() => {
    if (predictionsQuery.data) {
      dispatch({ type: "SET_PREDICTIONS", payload: predictionsQuery.data });
    }
    dispatch({
      type: "SET_LOADING_PREDICTIONS",
      payload: predictionsQuery.isLoading,
    });
  }, [predictionsQuery.data, predictionsQuery.isLoading, dispatch]);

  return {
    leagueTableQuery,
    totalWeeksQuery,
    weekResultsQuery,
    predictionsQuery,
  };
};
