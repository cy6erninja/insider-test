import React from "react";
import { useLeagueActions } from "../hooks";
import { useLeague } from "../context/LeagueContext";

const LeagueTable: React.FC = () => {
  const { state } = useLeague();
  const { leagueTable, loadingTable } = state;
  const { playAll, reset, playAllMutation, resetMutation } = useLeagueActions();

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1">
      <h2 className="font-bold text-lg mb-2 text-center">League Table</h2>
      {loadingTable ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="border-b">
              <th className="py-1">Teams</th>
              <th>PTS</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
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
          </tbody>
        </table>
      )}
      <div className="flex gap-2 mt-4 justify-center">
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
