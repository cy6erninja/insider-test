import React from "react";
import { useLeagueActions } from "../hooks";
import { useLeague } from "../context/LeagueContext";

const MatchResults: React.FC = () => {
  const {
    state: { currentWeek, weekResults, loadingResults, totalWeeks },
  } = useLeague();
  const { playNext, playNextMutation } = useLeagueActions();

  // Check if we're on the last week or beyond
  const isLastWeekOrBeyond =
    totalWeeks !== undefined && currentWeek >= totalWeeks;

  // Get the title based on current state
  const getStateTitle = () => {
    if (currentWeek === 0) {
      return "The league has not been started yet";
    } else if (isLastWeekOrBeyond) {
      return "The league has ended.";
    } else {
      return `${currentWeek}ᵗʰ Week Match Result`;
    }
  };

  // Render the match table or appropriate content
  const renderMatchContent = () => {
    // If league hasn't started
    if (currentWeek === 0) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gray-500 italic">No matches to display</div>
        </div>
      );
    }

    // If loading
    if (loadingResults) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      );
    }

    // If we have results
    if (weekResults?.data && weekResults.data.length > 0) {
      return (
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
      );
    }

    // Fallback for no results
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-gray-500">
          No results for this week
        </div>
      </div>
    );
  };

  // Show action button only in appropriate states
  const showActionButton =
    currentWeek === 0 || (currentWeek > 0 && !isLastWeekOrBeyond);

  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-w-[260px] flex-1 flex flex-col"
      style={{ minHeight: "400px" }}
    >
      <h2 className="font-bold text-lg mb-2 text-center">Match Results</h2>
      <div className="text-center mb-2 font-semibold">{getStateTitle()}</div>
      <div className="flex-grow overflow-auto mb-4">{renderMatchContent()}</div>
      {showActionButton && (
        <div className="flex justify-center mt-auto">
          <button
            className="bg-gray-300 dark:bg-gray-700 px-4 py-1 rounded disabled:opacity-50"
            onClick={() => playNext()}
            disabled={playNextMutation.isPending}
          >
            {currentWeek === 0 ? "Start League" : "Next Week"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchResults;
