import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  playNextWeek,
  playAllWeeks,
  resetLeague,
  fetchTotalWeeks,
} from "../services/leagueApi";
import { useLeague } from "@/context/LeagueContext";

/**
 * Hook for league actions and mutations
 */
export const useLeagueActions = () => {
  const { state, dispatch } = useLeague();
  const { currentWeek, totalWeeks } = state;
  const queryClient = useQueryClient();

  // Invalidate all relevant queries
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["leagueTable"] });
    queryClient.invalidateQueries({ queryKey: ["weekResults"] });
    queryClient.invalidateQueries({ queryKey: ["weekPredictions"] });
    queryClient.invalidateQueries({ queryKey: ["totalWeeks"] });
  };

  // Play next week mutation
  const playNextMutation = useMutation({
    mutationFn: () => playNextWeek(currentWeek + 1),
    onSuccess: () => {
      const nextWeek = currentWeek + 1;
      dispatch({ type: "SET_CURRENT_WEEK", payload: nextWeek });

      // Invalidate queries for the new week
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["leagueTable"] });
        queryClient.invalidateQueries({
          queryKey: ["weekResults", nextWeek],
        });
        queryClient.invalidateQueries({
          queryKey: ["weekPredictions", nextWeek],
        });
        queryClient.invalidateQueries({ queryKey: ["totalWeeks"] });
      }, 0);
    },
  });

  // Play all weeks mutation
  const playAllMutation = useMutation({
    mutationFn: playAllWeeks,
    onSuccess: async () => {
      // Fetch the total weeks (we need the latest value)
      // Default to 5 or use the current totalWeeks value if available
      let lastWeek = totalWeeks ?? 5;
      
      try {
        // Try to get the latest total weeks value
        const fetchedTotalWeeks = await fetchTotalWeeks();
        // Make sure we have a valid number
        if (typeof fetchedTotalWeeks === 'number') {
          lastWeek = fetchedTotalWeeks;
        }
      } catch {
        // If we can't fetch it, keep using the default value
        // No additional action needed as we already set lastWeek above
      }
      
      // Set current week to the last week
      dispatch({ type: "SET_CURRENT_WEEK", payload: lastWeek });
      
      // Then invalidate all the queries to update the data
      invalidateQueries();
    },
  });

  // Reset league mutation
  const resetMutation = useMutation({
    mutationFn: resetLeague,
    onSuccess: () => {
      // First clear all cached queries
      queryClient.clear();
      
      // Reset state - the RESET_STATE action already sets currentWeek to 0
      // so we don't need an additional SET_CURRENT_WEEK dispatch
      dispatch({ type: "RESET_STATE" });
      
      // Force a clean reload to ensure everything is in sync
      window.location.reload();
    },
  });

  return {
    playNext: () => playNextMutation.mutate(),
    playAll: () => playAllMutation.mutate(),
    reset: () => resetMutation.mutate(),
    playNextMutation,
    playAllMutation,
    resetMutation,
  };
}; 