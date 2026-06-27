import type {
  ResearchPreviewConfidence,
  ResearchPreviewDisplayStatus,
  ResearchPreviewEntity,
  ResearchPreviewSourceDisplay,
  ResearchPreviewState,
} from "@/features/create/types/research-preview.types";
import type { FootballResearchContext } from "@/features/research/types/football-research.types";
import {
  hasRankedPlayerResearch,
  hasUsefulResearchContent,
} from "@/features/research/utils/research-context-pass.utils";

import { detectResearchEntity } from "@/features/create/utils/research-preview.utils";

const ENTITY_LABELS: Record<ResearchPreviewEntity, string> = {
  player: "Player",
  team: "Team",
  match: "Match",
  competition: "Competition",
  ranking: "Ranking",
  year_season: "Year/season",
  unknown: "General topic",
};

const DISPLAY_STATUS_TONE: Record<ResearchPreviewDisplayStatus, string> = {
  Idle: "bg-surface-elevated/50 text-muted ring-border/25",
  Searching: "bg-accent/10 text-accent ring-accent/20",
  Ready: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  Limited: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  Unavailable: "bg-red-500/10 text-red-300 ring-red-500/20",
};

const CONFIDENCE_TONE: Record<ResearchPreviewConfidence, string> = {
  High: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  Medium: "bg-sky-500/10 text-sky-300 ring-sky-500/20",
  Low: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
};

const FRIENDLY_WARNING_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /no matching teams/i,
    message: "We couldn't match those teams to live data.",
  },
  {
    pattern: /no recent fixture/i,
    message: "No recent match was found for this topic.",
  },
  {
    pattern: /standings unavailable/i,
    message: "League standings aren't available right now.",
  },
  {
    pattern: /no ranking data/i,
    message: "Ranked lists aren't available — the story will stay qualitative.",
  },
  {
    pattern: /topscorers|top scorers|ranked.*unavailable/i,
    message: "Verified ranking data isn't available for this request.",
  },
  {
    pattern: /unreadable profile/i,
    message: "Player details couldn't be read clearly from the provider.",
  },
  {
    pattern: /curated all-time|static fallback|fallback/i,
    message: "Using curated reference notes instead of live stats.",
  },
  {
    pattern: /no verified player/i,
    message: "Player stats aren't verified — use cautious wording.",
  },
  {
    pattern: /squad selection|participation|if selected/i,
    message: "Squad or participation details may be unconfirmed.",
  },
  {
    pattern: /exact xg unavailable/i,
    message: "Expected goals (xG) aren't available for this match.",
  },
  {
    pattern: /provider|api-football|configured/i,
    message: "Live football data is limited for this topic.",
  },
];

export function researchPreviewDisplayStatusTone(status: ResearchPreviewDisplayStatus): string {
  return DISPLAY_STATUS_TONE[status];
}

export function researchPreviewConfidenceTone(confidence: ResearchPreviewConfidence): string {
  return CONFIDENCE_TONE[confidence];
}

export function resolveResearchPreviewDisplayStatus(
  preview: ResearchPreviewState,
  context?: FootballResearchContext,
): ResearchPreviewDisplayStatus {
  const resolvedContext = context ?? preview.researchContext;

  switch (preview.status) {
    case "idle":
      return "Idle";
    case "loading":
      return "Searching";
    case "error":
      return "Unavailable";
    case "fallback":
      return "Limited";
    case "success":
      return resolvedContext && hasUsefulResearchContent(resolvedContext) ? "Ready" : "Limited";
  }
}

export function resolveResearchPreviewConfidence(
  context: FootballResearchContext,
): ResearchPreviewConfidence {
  if (!hasUsefulResearchContent(context) || context.source === "fallback") {
    return "Low";
  }

  const factCount = context.facts.filter((fact) => fact.trim().length > 0).length;
  const hasStrongSignal =
    hasRankedPlayerResearch(context) ||
    Boolean(context.fixture) ||
    (context.standings?.length ?? 0) > 0 ||
    (context.statistics?.length ?? 0) > 0;

  if (context.source === "api-football" && hasStrongSignal && factCount >= 2) {
    return "High";
  }

  if (
    context.source === "api-football" ||
    (context.source === "static-fallback" && hasStrongSignal) ||
    (context.source === "manual" && factCount >= 1)
  ) {
    return "Medium";
  }

  return "Low";
}

export function resolveResearchPreviewSourceLabel(
  context: FootballResearchContext,
): ResearchPreviewSourceDisplay {
  if (!hasUsefulResearchContent(context)) {
    return "Prompt only";
  }

  switch (context.source) {
    case "manual":
      return "Manual notes";
    case "static-fallback":
      return "Static fallback";
    case "api-football":
      return "Smart Research";
    case "fallback":
      return "Prompt only";
    default:
      return "Prompt only";
  }
}

export function resolveResearchPreviewSourceDetail(
  context: FootballResearchContext,
): string | undefined {
  if (!hasUsefulResearchContent(context)) {
    return undefined;
  }

  if (context.source === "api-football") {
    return "Live data via API-Football";
  }

  if (context.source === "static-fallback") {
    return "Curated reference notes";
  }

  if (context.source === "manual") {
    return "From your additional notes";
  }

  return undefined;
}

export function detectResearchSeasonLabel(context: FootballResearchContext): string | undefined {
  const seasons = new Set<number>();

  if (context.fixture?.season != null) {
    seasons.add(context.fixture.season);
  }

  if (context.rankingIntent?.season != null) {
    seasons.add(context.rankingIntent.season);
  }

  for (const table of context.standings ?? []) {
    if (table.season != null) {
      seasons.add(table.season);
    }
  }

  for (const player of context.players ?? []) {
    if (player.season != null) {
      seasons.add(player.season);
    }
  }

  if (seasons.size === 0) {
    return undefined;
  }

  return [...seasons].sort((a, b) => b - a).join(", ");
}

export function detectResearchTags(context: FootballResearchContext): ResearchPreviewEntity[] {
  const tags = new Set<ResearchPreviewEntity>();
  const primary = detectResearchEntity(context);

  if (primary !== "unknown") {
    tags.add(primary);
  }

  if (detectResearchSeasonLabel(context)) {
    tags.add("year_season");
  }

  if (context.teams?.length && primary !== "team") {
    tags.add("team");
  }

  if (context.players?.length && primary !== "player" && primary !== "ranking") {
    tags.add("player");
  }

  if (context.standings?.length && primary !== "competition") {
    tags.add("competition");
  }

  if (tags.size === 0) {
    tags.add("unknown");
  }

  return [...tags];
}

export function formatResearchDetectedLabel(entity: ResearchPreviewEntity): string {
  return ENTITY_LABELS[entity];
}

export function selectResearchPreviewFacts(context: FootballResearchContext): string[] {
  const facts = context.facts.filter((fact) => fact.trim().length > 0);
  if (facts.length <= 6) {
    return facts;
  }
  return facts.slice(0, 6);
}

export function formatResearchPreviewWarning(warning: string): string {
  const trimmed = warning.trim();
  if (!trimmed) {
    return trimmed;
  }

  for (const { pattern, message } of FRIENDLY_WARNING_PATTERNS) {
    if (pattern.test(trimmed)) {
      return message;
    }
  }

  if (trimmed.length > 160) {
    return `${trimmed.slice(0, 157).trimEnd()}…`;
  }

  return trimmed;
}

export function dedupeFriendlyWarnings(warnings: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const warning of warnings) {
    const friendly = formatResearchPreviewWarning(warning);
    if (!friendly || seen.has(friendly)) {
      continue;
    }
    seen.add(friendly);
    result.push(friendly);
  }

  return result;
}
