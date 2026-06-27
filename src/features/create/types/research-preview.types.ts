import type { FootballResearchContext } from "@/features/research/types/football-research.types";
import type { ScriptMode } from "@/types/footiebitz";

export type ResearchPreviewStatus = "idle" | "loading" | "success" | "fallback" | "error";

export type ResearchPreviewEntity =
  | "player"
  | "team"
  | "match"
  | "competition"
  | "ranking"
  | "year_season"
  | "unknown";

export type ResearchPreviewDisplayStatus =
  | "Idle"
  | "Searching"
  | "Ready"
  | "Limited"
  | "Unavailable";

export type ResearchPreviewConfidence = "High" | "Medium" | "Low";

export type ResearchPreviewSourceDisplay =
  | "Smart Research"
  | "API-Football"
  | "Static fallback"
  | "Manual notes"
  | "Prompt only";

export interface ResearchPreviewState {
  status: ResearchPreviewStatus;
  topic?: string;
  mode?: ScriptMode;
  researchContext?: FootballResearchContext;
  contextText?: string;
  errorMessage?: string;
}

export const IDLE_RESEARCH_PREVIEW: ResearchPreviewState = { status: "idle" };
