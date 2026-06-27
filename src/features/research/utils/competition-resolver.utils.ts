import { resolveConfiguredSeason } from "@/lib/football/season.utils";

import type { RankingCompetition, RankingIntent, RankingTimeScope } from "@/features/research/types/ranking-intent.types";

export interface CompetitionDefinition {
  competition: RankingCompetition;
  leagueId: number;
  label: string;
  patterns: RegExp[];
}

export const RANKING_COMPETITIONS: CompetitionDefinition[] = [
  {
    competition: "premier_league",
    leagueId: 39,
    label: "Premier League",
    patterns: [/\bpremier league\b/i, /\bepl\b/i],
  },
  {
    competition: "la_liga",
    leagueId: 140,
    label: "La Liga",
    patterns: [/\bla liga\b/i],
  },
  {
    competition: "serie_a",
    leagueId: 135,
    label: "Serie A",
    patterns: [/\bserie a\b/i],
  },
  {
    competition: "bundesliga",
    leagueId: 78,
    label: "Bundesliga",
    patterns: [/\bbundesliga\b/i],
  },
  {
    competition: "ligue_1",
    leagueId: 61,
    label: "Ligue 1",
    patterns: [/\bligue 1\b/i],
  },
  {
    competition: "champions_league",
    leagueId: 2,
    label: "UEFA Champions League",
    patterns: [/\bchampions league\b/i, /\bucl\b/i],
  },
  {
    competition: "fifa_world_cup",
    leagueId: 1,
    label: "FIFA World Cup",
    patterns: [/\bfifa world cup\b/i, /\bworld cup\b/i],
  },
];

export interface ResolvedCompetition {
  competition: RankingCompetition;
  leagueId: number | null;
  label: string;
}

const KNOWN_LEAGUE_COMPETITIONS = new Set<RankingCompetition>(
  RANKING_COMPETITIONS.filter((entry) => entry.competition !== "fifa_world_cup").map(
    (entry) => entry.competition,
  ),
);

export function detectCompetitionFromTopic(topic: string): RankingCompetition {
  return resolveCompetitionFromTopic(topic).competition;
}

export function resolveCompetitionFromTopic(topic: string): ResolvedCompetition {
  const normalizedTopic = topic.trim().replace(/\s+/g, " ");

  for (const entry of RANKING_COMPETITIONS) {
    if (entry.patterns.some((pattern) => pattern.test(normalizedTopic))) {
      return {
        competition: entry.competition,
        leagueId: entry.leagueId,
        label: entry.label,
      };
    }
  }

  return {
    competition: "unknown",
    leagueId: null,
    label: "Unknown competition",
  };
}

export function getCompetitionLabel(competition: RankingCompetition): string {
  const match = RANKING_COMPETITIONS.find((entry) => entry.competition === competition);
  if (match) {
    return match.label;
  }

  return competition === "unknown" ? "competition" : competition;
}

export function getCompetitionLeagueId(competition: RankingCompetition): number | null {
  const match = RANKING_COMPETITIONS.find((entry) => entry.competition === competition);
  return match?.leagueId ?? null;
}

export function isKnownLeagueCompetition(competition: RankingCompetition): boolean {
  return KNOWN_LEAGUE_COMPETITIONS.has(competition);
}

export function detectRankingSeasonFromTopic(topic: string): number | undefined {
  const match = topic.match(/\b(19|20)\d{2}\b/);
  if (!match) {
    return undefined;
  }

  const season = Number(match[0]);
  return Number.isFinite(season) ? season : undefined;
}

/**
 * Resolves the API-Football season for ranking research.
 * Topic year wins; otherwise use configured season for season-scoped competitions.
 */
export function resolveRankingSeason(intent: RankingIntent): number | undefined {
  if (intent.season != null) {
    return intent.season;
  }

  if (intent.timeScope === "all_time") {
    return undefined;
  }

  return resolveConfiguredSeason();
}

export function detectRankingTimeScope(
  topic: string,
  competition: RankingCompetition,
  season?: number,
): RankingTimeScope {
  const normalizedTopic = topic.trim().replace(/\s+/g, " ").toLowerCase();

  if (/\ball[- ]time\b|\bever\b|\bhistory\b/i.test(normalizedTopic)) {
    return "all_time";
  }

  if (season != null) {
    return "season";
  }

  if (competition === "fifa_world_cup") {
    return "all_time";
  }

  if (isKnownLeagueCompetition(competition)) {
    return "season";
  }

  return "all_time";
}
