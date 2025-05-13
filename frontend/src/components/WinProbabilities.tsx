import React from "react";
import { useLeague } from "../context/LeagueContext";

const WinProbabilities: React.FC = () => {
  const { state } = useLeague();
  const { predictions, loadingPredictions } = state;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[220px] flex-1">
      <h2 className="font-bold text-lg mb-2 text-center">
        Championship Win Probabilities
      </h2>
      {loadingPredictions ? (
        <div>Loading...</div>
      ) : predictions?.data && predictions.data.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left pl-2">Team</th>
              <th className="text-right pr-2">Chance (%)</th>
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
        <div className="text-center text-gray-500 py-4">
          No predictions available
        </div>
      )}
    </div>
  );
};

export default WinProbabilities;
