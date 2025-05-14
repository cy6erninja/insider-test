import React, { useState, useEffect } from "react";
import { useLeague } from "../context/LeagueContext";
import { MatchResult } from "../types/league";
import { fetchAllWeeksResults } from "../services/leagueApi";

interface AllMatchesData {
  [week: number]: MatchResult[];
}

const AllLeagueMatches: React.FC = () => {
  const { state } = useLeague();
  const { totalWeeks, currentWeek } = state;
  const [allMatches, setAllMatches] = useState<AllMatchesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all matches that have been played so far
    if (currentWeek > 0) {
      fetchAllMatches();
    }
  }, [currentWeek, totalWeeks]);

  const fetchAllMatches = async () => {
    if (currentWeek === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Use the current week if the league hasn't ended yet
      const weeksToFetch =
        totalWeeks !== undefined && currentWeek >= totalWeeks
          ? totalWeeks
          : currentWeek;

      const matches = await fetchAllWeeksResults(weeksToFetch);
      setAllMatches(matches);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch match data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Show message if no matches have been played yet
  if (currentWeek === 0) {
    return (
      <div
        className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1 flex flex-col items-center justify-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-gray-500">No matches have been played yet</div>
      </div>
    );
  }

  // If the component is loading
  if (loading) {
    return (
      <div
        className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1 flex flex-col items-center justify-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-gray-500">Loading all matches...</div>
      </div>
    );
  }

  // If there was an error
  if (error) {
    return (
      <div
        className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1 flex flex-col items-center justify-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1 flex flex-col"
      style={{ minHeight: "400px" }}
    >
      <h2 className="font-bold text-lg mb-4 text-center">All League Matches</h2>

      <div className="flex-grow overflow-auto">
        {Object.keys(allMatches).length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">No match data available</div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(allMatches)
              .sort(([weekA], [weekB]) => parseInt(weekA) - parseInt(weekB))
              .map(([week, matches]) => (
                <div key={week} className="mb-4">
                  <h3 className="font-semibold text-md mb-2 text-center">
                    Week {week}
                  </h3>
                  <table className="w-full text-sm table-fixed">
                    <tbody>
                      {matches.map((match: MatchResult, index: number) => (
                        <tr
                          key={`${week}-${index}`}
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
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllLeagueMatches;
