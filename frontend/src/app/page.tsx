"use client";
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const API_BASE = "http://localhost:8080";

// Fetchers
const fetchLeagueTable = async () => {
  const res = await fetch(`${API_BASE}/league/results`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch league table");
  return res.json();
};

const fetchWeekResults = async (week: number) => {
  const res = await fetch(`${API_BASE}/league/week/${week}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch week results");
  return res.json();
};

const fetchWeekPredictions = async (week: number) => {
  const res = await fetch(`${API_BASE}/league/week/${week}/predictions`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch week predictions");
  return res.json();
};

const playAllWeeks = async () => {
  const res = await fetch(`${API_BASE}/league/play-all-weeks`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to play all weeks");
  return res.json();
};

const playNextWeek = async (week: number) => {
  const res = await fetch(`${API_BASE}/league/play-week/${week}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to play next week");
  return res.json();
};

const resetLeague = async () => {
  const res = await fetch(`${API_BASE}/league/reset`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to reset league");
  return res.json();
};

const fetchTotalWeeks = async () => {
  const res = await fetch(`${API_BASE}/league/results`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch league table");
  const data = await res.json();
  // Infer total weeks from the max P (played) or from backend if available
  // For now, hardcode to 5 if not present
  return data.totalWeeks ?? 5;
};

// Types
interface TeamStats {
  team_id: number;
  team: string;
  PTS: number;
  P: number;
  W: number;
  D: number;
  L: number;
  GD: number;
}

interface MatchResult {
  home: string;
  away: string;
  score: string;
  events: string[];
}

interface LeagueTableResponse {
  data: TeamStats[];
}

interface WeekResultsResponse {
  data: MatchResult[];
}

interface Prediction {
  team: string;
  chance: number;
}

// Main League UI
function League() {
  const [currentWeek, setCurrentWeek] = useState(0); // Start with week 0 (not started)
  const queryClient = useQueryClient();

  // Queries
  const { data: leagueTable, isLoading: loadingTable } =
    useQuery<LeagueTableResponse>({
      queryKey: ["leagueTable"],
      queryFn: fetchLeagueTable,
    });
  const { data: totalWeeks } = useQuery<number>({
    queryKey: ["totalWeeks"],
    queryFn: fetchTotalWeeks,
  });
  const { data: weekResults, isLoading: loadingResults } =
    useQuery<WeekResultsResponse>({
      queryKey: ["weekResults", currentWeek],
      queryFn: () =>
        currentWeek > 0
          ? fetchWeekResults(currentWeek)
          : Promise.resolve({ data: [] }),
      enabled: currentWeek > 0,
    });
  const { isLoading: loadingPredictions, data: predictions } = useQuery<{
    data: Prediction[];
  }>({
    queryKey: ["weekPredictions", currentWeek],
    queryFn: () => fetchWeekPredictions(currentWeek),
    enabled: totalWeeks !== undefined,
  });

  // Mutations
  const playAllMutation = useMutation({
    mutationFn: playAllWeeks,
    onSuccess: () => {
      if (totalWeeks) {
        setCurrentWeek(totalWeeks);
      }
      queryClient.invalidateQueries({ queryKey: ["leagueTable"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["weekResults", totalWeeks] });
      queryClient.invalidateQueries({
        queryKey: ["weekPredictions", totalWeeks],
      });
    },
  });
  const playNextMutation = useMutation({
    mutationFn: () => playNextWeek(currentWeek + 1),
    onSuccess: () => {
      setCurrentWeek((w) => {
        const nextWeek = w + 1;
        // Invalidate queries for the new week after state update
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["leagueTable"] });
          queryClient.invalidateQueries({
            queryKey: ["weekResults", nextWeek],
          });
          queryClient.invalidateQueries({
            queryKey: ["weekPredictions", nextWeek],
          });
        }, 0);
        return nextWeek;
      });
    },
  });
  const resetMutation = useMutation({
    mutationFn: resetLeague,
    onSuccess: () => {
      setCurrentWeek(0);
      queryClient.invalidateQueries({ queryKey: ["leagueTable"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["weekResults"] });
      queryClient.invalidateQueries({ queryKey: ["weekPredictions"] });
      queryClient.invalidateQueries({ queryKey: ["totalWeeks"] });
    },
  });

  // Render
  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-start w-full max-w-5xl mx-auto mt-8">
      {/* League Table */}
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
            onClick={() => playAllMutation.mutate()}
            disabled={playAllMutation.isPending}
          >
            Play All
          </button>
          <button
            className="bg-red-500 text-white px-4 py-1 rounded disabled:opacity-50"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Match Results */}
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
              disabled={
                playNextMutation.isPending ||
                (currentWeek === 0 && playAllMutation.isPending)
              }
            >
              {currentWeek === 0 ? "Start League" : "Next Week"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Predictions */}
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
              {predictions.data.map((pred: Prediction, idx: number) => (
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
    </div>
  );
}

const queryClient = new QueryClient();

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <League />
    </QueryClientProvider>
  );
}
