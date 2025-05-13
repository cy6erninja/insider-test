import React from "react";
import { useLeague } from "../context/LeagueContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playNextWeek } from "../services/leagueApi";

const MatchResults: React.FC = () => {
  const { state, dispatch } = useLeague();
  const { currentWeek, weekResults, loadingResults, totalWeeks } = state;
  const queryClient = useQueryClient();

  // Mutation for playing next week
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

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1">
      <h2 className="font-bold text-lg mb-2 text-center">Match Results</h2>
      <div className="text-center mb-2 font-semibold">
        {currentWeek === 0
          ? "The league has not been started yet"
          : totalWeeks && currentWeek > totalWeeks
            ? "The league has ended."
            : `${currentWeek}ᵗʰ Week Match Result`}
      </div>
      {loadingResults ? (
        <div>Loading...</div>
      ) : currentWeek === 0 ? null : totalWeeks &&
        currentWeek > totalWeeks ? null : weekResults?.data &&
        weekResults.data.length > 0 ? (
        <table className="w-full text-sm table-fixed">
          <tbody>
            {weekResults.data.map((match) => (
              <tr
                key={match.home + match.away}
                className="border-b last:border-0"
              >
                <td className="font-semibold w-2/5 break-words whitespace-normal text-left pl-2">
                  {match.home}
                </td>
                <td className="w-1/5 px-2">
                  <div className="flex justify-center items-center w-full font-mono">
                    {match.score}
                  </div>
                </td>
                <td className="font-semibold w-2/5 break-words whitespace-normal text-right pr-2">
                  {match.away}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No results for this week
        </div>
      )}
      <div className="flex justify-center mt-4">
        {totalWeeks && currentWeek < totalWeeks ? (
          <button
            className="bg-gray-300 dark:bg-gray-700 px-4 py-1 rounded disabled:opacity-50"
            onClick={() => playNextMutation.mutate()}
            disabled={playNextMutation.isPending}
          >
            {currentWeek === 0 ? "Start League" : "Next Week"}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default MatchResults;
