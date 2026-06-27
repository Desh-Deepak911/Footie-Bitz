export type PlayerSquadStatus = "unknown" | "confirmed";

export type PlayerAnalysisCompetitionKey =
  | "fifa_world_cup_2026"
  | "fifa_world_cup"
  | "premier_league"
  | "la_liga"
  | "serie_a"
  | "bundesliga"
  | "ligue_1"
  | "champions_league";

/** Parsed player-analysis brief metadata from the user topic. */
export interface PlayerAnalysisIntent {
  playerName: string;
  competitionLabel?: string;
  competitionKey?: PlayerAnalysisCompetitionKey;
  year?: number;
  squadStatus: PlayerSquadStatus;
}

export interface ParsedPlayerAnalysisTopic {
  playerName: string;
  competitionLabel?: string;
  competitionKey?: PlayerAnalysisCompetitionKey;
  year?: number;
}
