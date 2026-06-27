import type { FootballResearchContext, FootballResearchSource } from "@/features/research/types/football-research.types";

const PASSABLE_RESEARCH_SOURCES = new Set<FootballResearchSource>([
  "api-football",
  "static-fallback",
  "manual",
]);

export function hasRankedPlayerResearch(context: FootballResearchContext): boolean {
  return (context.players ?? []).some(
    (player) => player.name.trim().length > 0 && player.goals != null,
  );
}

export function hasUsefulResearchContent(context: FootballResearchContext): boolean {
  if (hasRankedPlayerResearch(context)) {
    return true;
  }

  if (context.fixture) {
    return true;
  }

  if (context.teams?.length) {
    return true;
  }

  if (context.standings?.length) {
    return true;
  }

  if (context.statistics?.length) {
    return true;
  }

  if (context.events?.length) {
    return true;
  }

  if (context.lineups?.length) {
    return true;
  }

  return context.facts.some((fact) => fact.trim().length > 0);
}

/**
 * Whether researched context text should be merged into script generation.
 * Warnings-only fallback payloads are excluded.
 */
export function shouldPassResearchContextToScript(context: FootballResearchContext): boolean {
  if (!hasUsefulResearchContent(context)) {
    return false;
  }

  if (context.source === "static-fallback" && hasRankedPlayerResearch(context)) {
    return true;
  }

  if (PASSABLE_RESEARCH_SOURCES.has(context.source)) {
    return true;
  }

  return false;
}

export function isResearchContextTextUseful(contextText: string | undefined): boolean {
  const trimmed = contextText?.trim();
  if (!trimmed) {
    return false;
  }

  if (/RANKED PLAYER DATA:/i.test(trimmed)) {
    return true;
  }

  if (!trimmed.includes("RESEARCHED FOOTBALL CONTEXT")) {
    return trimmed.length > 0;
  }

  const bodyWithoutWarnings = trimmed.replace(/\nWarnings:[\s\S]*$/m, "").trim();
  return /(?:^|\n)- .+/m.test(bodyWithoutWarnings);
}
