import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useLeague } from "../context/LeagueContext";
import {
  playNextWeek,
  playAllWeeks,
  resetLeague,
} from "../services/leagueApi";

/**
 * Hook for league actions and mutations
 */
export const useLeagueActions = () => {
  const { state, dispatch } = useLeague();
  const { currentWeek } = state;
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
      }, 0);
    },
  });

  // Play all weeks mutation
  const playAllMutation = useMutation({
    mutationFn: playAllWeeks,
    onSuccess: invalidateQueries,
  });

  // Reset league mutation
  const resetMutation = useMutation({
    mutationFn: resetLeague,
    onSuccess: invalidateQueries,
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