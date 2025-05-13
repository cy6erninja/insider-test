import React from "react";
import { useQuery } from "@tanstack/react-query";
import LeagueTable from "./LeagueTable";
import MatchResults from "./MatchResults";
import WinProbabilities from "./WinProbabilities";
import {
  fetchLeagueTable,
  fetchWeekResults,
  fetchWeekPredictions,
  fetchTotalWeeks,
} from "../services/leagueApi";
import { useLeague } from "../context/LeagueContext";

function League() {
  const { state, dispatch } = useLeague();
  const {
    currentWeek,
    totalWeeks,
  } = state;

  // Queries
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

  const totalWeeksQuery = useQuery({
    queryKey: ["totalWeeks"],
    queryFn: fetchTotalWeeks,
  });

  React.useEffect(() => {
    if (totalWeeksQuery.data) {
      dispatch({ type: "SET_TOTAL_WEEKS", payload: totalWeeksQuery.data });
    }
  }, [totalWeeksQuery.data, dispatch]);

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

  const predictionsQuery = useQuery({
    queryKey: ["weekPredictions", currentWeek],
    queryFn: () => fetchWeekPredictions(currentWeek),
    enabled: totalWeeks !== undefined,
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

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full max-w-5xl mx-auto mt-8">
      <LeagueTable />
      <MatchResults />
      <WinProbabilities />
    </div>
  );
}

export default League;
