/** Research-layer content mode — mirrors script format options without coupling to script types. */
export type FootballResearchMode =
  | "story"
  | "tactical_review"
  | "match_preview"
  | "match_recap"
  | "player_analysis"
  | "top_5"
  | "historical_explainer"
  | "opinion_debate";

export const FOOTBALL_RESEARCH_MODES: FootballResearchMode[] = [
  "story",
  "tactical_review",
  "match_preview",
  "match_recap",
  "player_analysis",
  "top_5",
  "historical_explainer",
  "opinion_debate",
];

export type FootballResearchSource = "api-football" | "static-fallback" | "manual" | "fallback";

export interface FootballResearchTeam {
  id: number;
  name: string;
  country?: string;
}

export interface FootballResearchPlayer {
  id: number;
  name: string;
  nationality?: string;
  team?: string;
  league?: string;
  season?: number;
  appearances?: number;
  goals?: number | null;
  assists?: number | null;
  position?: string;
  rating?: string;
}

export interface FootballResearchFixture {
  id: number;
  date: string;
  status?: string;
  league: string;
  season?: number;
  round?: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
}

export interface FootballResearchStatistic {
  team: string;
  type: string;
  value: string | number | null;
}

export interface FootballResearchEvent {
  minute?: number;
  extraMinute?: number | null;
  team: string;
  player?: string;
  assist?: string;
  type?: string;
  detail?: string;
}

export interface FootballResearchLineup {
  team: string;
  formation?: string | null;
  startingXi: string[];
  substitutes: string[];
}

export interface FootballResearchStandingRow {
  rank: number;
  team: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string | null;
}

export interface FootballResearchStandings {
  league: string;
  season: number;
  rows: FootballResearchStandingRow[];
}

import type { RankingIntent } from "@/features/research/types/ranking-intent.types";
import type { PlayerAnalysisIntent } from "@/features/research/types/player-analysis.types";

/** Normalized football research payload for script enrichment and review display. */
export interface FootballResearchContext {
  mode: FootballResearchMode;
  topic: string;
  summary: string;
  facts: string[];
  rankingIntent?: RankingIntent;
  playerAnalysisIntent?: PlayerAnalysisIntent;
  teams?: FootballResearchTeam[];
  players?: FootballResearchPlayer[];
  fixture?: FootballResearchFixture;
  statistics?: FootballResearchStatistic[];
  events?: FootballResearchEvent[];
  lineups?: FootballResearchLineup[];
  standings?: FootballResearchStandings[];
  warnings: string[];
  source: FootballResearchSource;
}

export function isFootballResearchMode(value: unknown): value is FootballResearchMode {
  return typeof value === "string" && FOOTBALL_RESEARCH_MODES.includes(value as FootballResearchMode);
}

export function resolveFootballResearchMode(value: unknown): FootballResearchMode {
  return isFootballResearchMode(value) ? value : "story";
}

export function isAppliedFootballResearchSource(source: FootballResearchSource): boolean {
  return source === "api-football" || source === "static-fallback" || source === "manual";
}
