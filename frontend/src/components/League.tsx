import React, { useState } from "react";
import LeagueTable from "./LeagueTable";
import MatchResults from "./MatchResults";
import WinProbabilities from "./WinProbabilities";
import AllLeagueMatches from "./AllLeagueMatches";
import { useLeagueData } from "../hooks";
import { useLeague } from "../context/LeagueContext";

function League() {
  useLeagueData();
  const { state } = useLeague();
  const { currentWeek, totalWeeks } = state;

  // State to track which view to show
  const [showAllMatches, setShowAllMatches] = useState(false);

  // Check if league has ended
  const isLeagueEnded = totalWeeks !== undefined && currentWeek >= totalWeeks;

  // Automatically show all matches when league ends
  React.useEffect(() => {
    if (isLeagueEnded) {
      setShowAllMatches(true);
    }
  }, [isLeagueEnded]);

  // Only show toggle if the league has started
  const showToggle = currentWeek > 0;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto mt-8">
      {showToggle && (
        <div className="mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setShowAllMatches(false)}
              className={`px-4 py-2 rounded-l-lg ${
                !showAllMatches
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              }`}
            >
              Current Matches
            </button>
            <button
              onClick={() => setShowAllMatches(true)}
              className={`px-4 py-2 rounded-r-lg ${
                showAllMatches
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
              }`}
            >
              All Matches
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full">
        <LeagueTable />
        {showAllMatches ? <AllLeagueMatches /> : <MatchResults />}
        <WinProbabilities />
      </div>
    </div>
  );
}

export default League;
