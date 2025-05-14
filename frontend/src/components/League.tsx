import React from "react";
import LeagueTable from "./LeagueTable";
import MatchResults from "./MatchResults";
import WinProbabilities from "./WinProbabilities";
import { useLeagueData } from "../hooks";

function League() {
  useLeagueData();

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full max-w-5xl mx-auto mt-8">
      <LeagueTable />
      <MatchResults />
      <WinProbabilities />
    </div>
  );
}

export default League;
