export interface TeamStats {
  team_id: number;
  team: string;
  PTS: number;
  P: number;
  W: number;
  D: number;
  L: number;
  GD: number;
}

export interface MatchResult {
  home: string;
  away: string;
  score: string;
  events: string[];
}

export interface LeagueTableResponse {
  data: TeamStats[];
}

export interface WeekResultsResponse {
  data: MatchResult[];
}

export interface Prediction {
  team: string;
  chance: number;
} 