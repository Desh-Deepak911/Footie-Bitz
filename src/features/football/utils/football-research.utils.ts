import type { ScriptMode } from "@/types/footiebitz";

const TEAM_SPLIT_PATTERN = /\s+(?:vs\.?|v\.?|against)\s+/i;

/** Split a brief into team or player search terms. */
export function extractFootballSearchQueries(topic: string, scriptMode: ScriptMode): string[] {
  const trimmed = topic.trim();
  if (!trimmed) {
    return [];
  }

  if (scriptMode === "player_analysis") {
    return [trimmed];
  }

  if (TEAM_SPLIT_PATTERN.test(trimmed)) {
    return trimmed
      .split(TEAM_SPLIT_PATTERN)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

export function mergeFootballContext(
  manualContext?: string,
  researchedContext?: string,
): string | undefined {
  const manual = manualContext?.trim();
  const researched = researchedContext?.trim();

  if (manual && researched) {
    return `${manual}\n\n--- Football research ---\n${researched}`;
  }

  if (researched) {
    return researched;
  }

  return manual || undefined;
}

/** Current European-style season year for API-Football `season` params. */
export function resolveFootballSeasonYear(reference = new Date()): number {
  const month = reference.getUTCMonth();
  const year = reference.getUTCFullYear();
  return month >= 7 ? year : year - 1;
}

export function isPlayerFocusedScriptMode(scriptMode: ScriptMode): boolean {
  return scriptMode === "player_analysis";
}

export function isMatchFocusedScriptMode(scriptMode: ScriptMode): boolean {
  return (
    scriptMode === "match_preview" ||
    scriptMode === "match_recap" ||
    scriptMode === "tactical_review"
  );
}
