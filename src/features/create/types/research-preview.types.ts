import type { FootballResearchContext } from "@/features/research/types/football-research.types";
import type { ScriptMode } from "@/types/footiebitz";

export type ResearchPreviewStatus = "idle" | "loading" | "success" | "fallback" | "error";

export type ResearchPreviewEntity =
  | "player"
  | "team"
  | "match"
  | "competition"
  | "ranking"
  | "unknown";

export interface ResearchPreviewState {
  status: ResearchPreviewStatus;
  topic?: string;
  mode?: ScriptMode;
  researchContext?: FootballResearchContext;
  contextText?: string;
  errorMessage?: string;
}

export const IDLE_RESEARCH_PREVIEW: ResearchPreviewState = { status: "idle" };
