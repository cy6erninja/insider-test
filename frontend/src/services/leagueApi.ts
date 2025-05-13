const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export const fetchLeagueTable = async () => {
  const res = await fetch(`${API_BASE}/league/results`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch league table");
  return res.json();
};

export const fetchWeekResults = async (week: number) => {
  const res = await fetch(`${API_BASE}/league/week/${week}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch week results");
  return res.json();
};

export const fetchWeekPredictions = async (week: number) => {
  const res = await fetch(`${API_BASE}/league/week/${week}/predictions`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch week predictions");
  return res.json();
};

export const playAllWeeks = async () => {
  const res = await fetch(`${API_BASE}/league/play-all-weeks`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to play all weeks");
  return res.json();
};

export const playNextWeek = async (week: number) => {
  const res = await fetch(`${API_BASE}/league/play-week/${week}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to play next week");
  return res.json();
};

export const resetLeague = async () => {
  const res = await fetch(`${API_BASE}/league/reset`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to reset league");
  return res.json();
};

export const fetchTotalWeeks = async () => {
  const res = await fetch(`${API_BASE}/league/results`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch league table");
  const data = await res.json();
  // Infer total weeks from the max P (played) or from backend if available
  // For now, hardcode to 5 if not present
  return data.totalWeeks ?? 5;
}; 