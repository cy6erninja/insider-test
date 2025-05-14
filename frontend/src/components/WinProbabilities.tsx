import React, { useEffect } from "react";
import { useLeague } from "../context/LeagueContext";
import { useQueryClient } from "@tanstack/react-query";
import { fetchWeekPredictions } from "../services/leagueApi";

const WinProbabilities: React.FC = () => {
  const { state } = useLeague();
  const { predictions, loadingPredictions, currentWeek, totalWeeks } = state;
  const queryClient = useQueryClient();

  // Check if league has ended
  const isLeagueEnded = totalWeeks !== undefined && currentWeek >= totalWeeks;

  // Force refresh predictions when league ends
  useEffect(() => {
    if (isLeagueEnded) {
      // Get the latest predictions after a short delay to ensure all other data is updated
      const refreshPredictions = async () => {
        try {
          // Invalidate the prediction cache
          queryClient.invalidateQueries({ queryKey: ["weekPredictions"] });

          // Prefetch the latest predictions
          await queryClient.prefetchQuery({
            queryKey: ["weekPredictions", currentWeek],
            queryFn: () => fetchWeekPredictions(currentWeek),
          });
        } catch (error) {
          console.error("Failed to refresh predictions:", error);
        }
      };

      // Add a small delay to ensure all data is updated first
      const timer = setTimeout(refreshPredictions, 500);
      return () => clearTimeout(timer);
    }
  }, [isLeagueEnded, currentWeek, queryClient]);

  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[220px] flex-1 flex flex-col"
      style={{ minHeight: "400px" }}
    >
      <h2 className="font-bold text-lg mb-2 text-center">
        Championship Win Probabilities
      </h2>
      <div className="flex-grow overflow-auto">
        {loadingPredictions ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : predictions?.data && predictions.data.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pl-2 sticky top-0 bg-gray-100 dark:bg-gray-900">
                  Team
                </th>
                <th className="text-right pr-2 sticky top-0 bg-gray-100 dark:bg-gray-900">
                  Chance (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.data.map((pred, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="font-semibold text-left pl-2">{pred.team}</td>
                  <td className="text-right pr-2">{pred.chance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              No predictions available
            </div>
          </div>
        )}
      </div>

      {/* Add a manual refresh button when league has ended */}
      {isLeagueEnded && (
        <div className="mt-4 text-center">
          <button
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["weekPredictions"] })
            }
          >
            Refresh probabilities
          </button>
        </div>
      )}
    </div>
  );
};

export default WinProbabilities;
