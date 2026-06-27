import type { FootballResearchContext, FootballResearchSource } from "@/features/research/types/football-research.types";
import { getCompetitionLabel } from "@/features/research/utils/competition-resolver.utils";
import { hasRankedPlayerResearch, hasUsefulResearchContent, shouldPassResearchContextToScript } from "@/features/research/utils/research-context-pass.utils";

import type { ResearchPreviewEntity, ResearchPreviewState, ResearchPreviewStatus } from "@/features/create/types/research-preview.types";
import type { GenerateScriptResearchPreview, ScriptMode } from "@/types/footiebitz";

const SOURCE_LABELS: Record<FootballResearchSource, string> = {
  "api-football": "API-Football",
  "static-fallback": "Static fallback",
  manual: "Manual",
  fallback: "Fallback",
};

export function formatResearchSourceLabel(source: FootballResearchSource): string {
  return SOURCE_LABELS[source];
}

export function detectResearchEntity(context: FootballResearchContext): ResearchPreviewEntity {
  if (context.rankingIntent || context.mode === "top_5" || hasRankedPlayerResearch(context)) {
    return "ranking";
  }

  if (context.fixture) {
    return "match";
  }

  if (context.mode === "player_analysis" && context.players?.length) {
    return "player";
  }

  if (context.players?.length) {
    return "player";
  }

  if (context.standings?.length) {
    return "competition";
  }

  if (context.teams?.length) {
    return "team";
  }

  return "unknown";
}

export function formatResearchEntityLabel(entity: ResearchPreviewEntity): string {
  switch (entity) {
    case "player":
      return "Player";
    case "team":
      return "Team";
    case "match":
      return "Match";
    case "competition":
      return "Competition";
    case "ranking":
      return "Ranking";
    default:
      return "Unknown";
  }
}

export function resolveResearchPreviewStatus(
  context: FootballResearchContext,
  httpOk: boolean,
): ResearchPreviewStatus {
  if (!httpOk) {
    return "error";
  }

  if (
    hasUsefulResearchContent(context) &&
    (context.source === "api-football" ||
      context.source === "static-fallback" ||
      context.source === "manual")
  ) {
    return "success";
  }

  if (context.source === "fallback" || !hasUsefulResearchContent(context)) {
    return "fallback";
  }

  return "success";
}

export function formatRankingIntentSummary(context: FootballResearchContext): string | undefined {
  const intent = context.rankingIntent;
  if (!intent) {
    return undefined;
  }

  const competition = getCompetitionLabel(intent.competition);
  const scope = intent.timeScope === "all_time" ? "all-time" : "season";
  const season = intent.season != null ? ` · ${intent.season}` : "";
  return `${intent.rankingType.replace(/_/g, " ")} · ${competition} · ${scope}${season} · top ${intent.limit}`;
}

export function buildGenerateScriptResearchPreview(
  preview: ResearchPreviewState,
): GenerateScriptResearchPreview | undefined {
  if (
    preview.status !== "success" ||
    !preview.topic ||
    !preview.mode ||
    !preview.researchContext ||
    !preview.contextText?.trim() ||
    !shouldPassResearchContextToScript(preview.researchContext)
  ) {
    return undefined;
  }

  return {
    topic: preview.topic,
    mode: preview.mode,
    researchContext: preview.researchContext,
    contextText: preview.contextText,
  };
}

export function isResearchPreviewReusableForGenerate(input: {
  preview: ResearchPreviewState;
  topic: string;
  scriptMode: ScriptMode;
  enableResearch: boolean;
}): boolean {
  if (!input.enableResearch) {
    return false;
  }

  const payload = buildGenerateScriptResearchPreview(input.preview);
  if (!payload) {
    return false;
  }

  return (
    payload.topic.trim() === input.topic.trim() && payload.mode === input.scriptMode
  );
}
