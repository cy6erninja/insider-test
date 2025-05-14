import React from "react";
import { useLeagueActions } from "../hooks";
import { useLeague } from "../context/LeagueContext";

const LeagueTable: React.FC = () => {
  const { state } = useLeague();
  const { leagueTable, loadingTable } = state;
  const { playAll, reset, playAllMutation, resetMutation } = useLeagueActions();

  // Height calculation: 4 teams + header + buttons area
  // This ensures a consistent height
  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1 flex flex-col"
      style={{ minHeight: "400px" }}
    >
      <h2 className="font-bold text-lg mb-2 text-center">League Table</h2>
      <div className="flex-grow overflow-auto mb-4">
        {loadingTable ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="border-b">
                <th className="py-1 sticky top-0 bg-gray-100 dark:bg-gray-900">
                  Teams
                </th>
                <th className="sticky top-0 bg-gray-100 dark:bg-gray-900">
                  PTS
                </th>
                <th className="sticky top-0 bg-gray-100 dark:bg-gray-900">P</th>
                <th className="sticky top-0 bg-gray-100 dark:bg-gray-900">W</th>
                <th className="sticky top-0 bg-gray-100 dark:bg-gray-900">D</th>
                <th className="sticky top-0 bg-gray-100 dark:bg-gray-900">L</th>
                <th className="sticky top-0 bg-gray-100 dark:bg-gray-900">
                  GD
                </th>
              </tr>
            </thead>
            <tbody>
              {leagueTable?.data?.map((team) => (
                <tr key={team.team_id} className="border-b last:border-0">
                  <td className="font-semibold text-left pl-2">{team.team}</td>
                  <td>{team.PTS}</td>
                  <td>{team.P}</td>
                  <td>{team.W}</td>
                  <td>{team.D}</td>
                  <td>{team.L}</td>
                  <td>{team.GD}</td>
                </tr>
              ))}
              {/* Add empty rows if we have fewer than 4 teams to maintain consistent height */}
              {!leagueTable?.data &&
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={`empty-${i}`} className="border-b last:border-0">
                      <td className="h-8">&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex gap-2 justify-center mt-auto">
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
          onClick={() => playAll()}
          disabled={playAllMutation.isPending}
        >
          Play All
        </button>
        <button
          className="bg-red-500 text-white px-4 py-1 rounded disabled:opacity-50"
          onClick={() => reset()}
          disabled={resetMutation.isPending}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default LeagueTable;
