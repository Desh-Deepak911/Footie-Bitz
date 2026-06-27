import type { ApiFootballPlayerSearchItem } from "@/lib/football";
import type {
  FootballResearchContext,
  FootballResearchPlayer,
} from "@/features/research/types/football-research.types";
import type {
  ParsedPlayerAnalysisTopic,
  PlayerAnalysisIntent,
} from "@/features/research/types/player-analysis.types";
import {
  FIFA_WORLD_CUP_2026_NOT_QATAR_FACT,
} from "@/features/research/utils/research-grounding.utils";

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

export function pickBestPlayerSearchMatch(
  searchName: string,
  entries: ApiFootballPlayerSearchItem[],
): ApiFootballPlayerSearchItem | null {
  if (entries.length === 0) {
    return null;
  }

  const query = normalizeName(searchName);
  const queryParts = query.split(/\s+/).filter(Boolean);

  if (!queryParts.length) {
    return entries[0] ?? null;
  }

  let bestEntry = entries[0]!;
  let bestScore = -1;

  for (const entry of entries) {
    const candidateName = normalizeName(entry.player.name);
    let score = 0;

    if (candidateName === query) {
      score += 100;
    }

    for (const part of queryParts) {
      if (candidateName.includes(part)) {
        score += 10;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return bestEntry;
}

export function buildVerifiedPlayerFactStrings(player: FootballResearchPlayer): string[] {
  const strings: string[] = [];

  if (player.nationality) {
    strings.push(`Nationality: ${player.nationality}`);
  }
  if (player.position) {
    strings.push(`Position: ${player.position}`);
  }
  if (player.team) {
    strings.push(`Club: ${player.team}`);
  }
  if (player.league) {
    strings.push(`League: ${player.league}`);
  }
  if (player.season != null) {
    strings.push(`API season: ${player.season}`);
  }
  if (player.appearances != null) {
    strings.push(`Appearances: ${player.appearances}`);
  }
  if (player.goals != null) {
    strings.push(`Goals: ${player.goals}`);
  }
  if (player.assists != null) {
    strings.push(`Assists: ${player.assists}`);
  }
  if (player.rating) {
    strings.push(`Rating: ${player.rating}`);
  }

  return strings;
}

/** Verified API-backed player facts only — never invent missing stats. */
export function buildVerifiedPlayerFactLines(player: FootballResearchPlayer): string[] {
  return buildVerifiedPlayerFactStrings(player).map((fact) => `- ${fact}`);
}

export function buildPlayerAnalysisIntent(
  parsed: ParsedPlayerAnalysisTopic,
): PlayerAnalysisIntent {
  return {
    playerName: parsed.playerName,
    competitionLabel: parsed.competitionLabel,
    competitionKey: parsed.competitionKey,
    year: parsed.year,
    squadStatus: "unknown",
  };
}

export function appendFifaWorldCup2026TournamentFacts(
  context: FootballResearchContext,
  intent: PlayerAnalysisIntent,
): void {
  intent.competitionKey = "fifa_world_cup_2026";
  intent.competitionLabel = "FIFA World Cup 2026";
  intent.year = 2026;
  intent.squadStatus = "unknown";

  const tournamentFacts = [
    "Competition: FIFA World Cup 2026",
    "Tournament year: 2026",
    "Host nations: USA, Canada, Mexico",
    FIFA_WORLD_CUP_2026_NOT_QATAR_FACT,
  ];

  const seen = new Set(context.facts);
  for (const fact of tournamentFacts) {
    if (!seen.has(fact)) {
      seen.add(fact);
      context.facts.push(fact);
    }
  }

  if (!context.warnings.some((warning) => /2026 World Cup squad/i.test(warning))) {
    context.warnings.push(
      "2026 World Cup squad selection/participation: unknown — not confirmed by API.",
    );
  }
}

export function collectPlayerAnalysisUnknowns(context: FootballResearchContext): string[] {
  const intent = context.playerAnalysisIntent;
  const player = context.players?.[0];
  const unknowns: string[] = [];

  if (!player && intent?.playerName) {
    unknowns.push(
      `No API-Football player profile matched for "${intent.playerName}".`,
    );
  }

  if (player) {
    if (player.goals == null && player.appearances == null && player.assists == null) {
      unknowns.push("Season stat lines (goals, assists, appearances): not returned by API.");
    }
  }

  if (
    intent?.competitionKey === "fifa_world_cup_2026" ||
    intent?.competitionLabel === "FIFA World Cup 2026"
  ) {
    if (intent.squadStatus !== "confirmed") {
      unknowns.push(
        "FIFA World Cup 2026 squad selection/participation: unknown — say \"if selected\" or \"if he appears\".",
      );
    }
  }

  return unknowns;
}
