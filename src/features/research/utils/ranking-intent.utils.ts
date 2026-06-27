import type {
  RankingIntent,
  RankingType,
} from "@/features/research/types/ranking-intent.types";
import type { FootballResearchMode } from "@/features/research/types/football-research.types";

import {
  detectCompetitionFromTopic,
  detectRankingSeasonFromTopic,
  detectRankingTimeScope,
} from "./competition-resolver.utils";
import { normalizeTop5ScorersIntent } from "./top-scorers-research.utils";

const TOP_SCORERS_PATTERNS: RegExp[] = [
  /\btop scorers\b/i,
  /\bhighest goal scorers\b/i,
  /\bgoal scorers\b/i,
  /\bgoal scorer\b/i,
  /\bgolden boot\b/i,
  /\bmost goals\b/i,
];

const DEFAULT_RANKING_LIMIT = 5;
const MAX_RANKING_LIMIT = 10;

function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

function detectRankingType(normalizedTopic: string): RankingType {
  if (TOP_SCORERS_PATTERNS.some((pattern) => pattern.test(normalizedTopic))) {
    return "top_scorers";
  }

  if (/\bscorers?\b/i.test(normalizedTopic) && /\btop\b|\bhighest\b|\bmost\b/i.test(normalizedTopic)) {
    return "top_scorers";
  }

  return "unknown";
}

function detectLimit(topic: string, defaultLimit = DEFAULT_RANKING_LIMIT): number {
  const topNumberMatch = topic.match(/\btop\s+(\d{1,2})\b/i);
  if (topNumberMatch) {
    const parsed = Number(topNumberMatch[1]);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(MAX_RANKING_LIMIT, Math.round(parsed));
    }
  }

  if (/\btop five\b/i.test(topic)) {
    return 5;
  }

  return defaultLimit;
}

/**
 * Parses a top_5 brief into structured ranking intent (competition, metric, time scope).
 */
export function parseRankingIntent(
  topic: string,
  defaultLimit = DEFAULT_RANKING_LIMIT,
  mode?: FootballResearchMode,
): RankingIntent {
  const normalizedTopic = normalizeTopic(topic);
  const season = detectRankingSeasonFromTopic(normalizedTopic);
  const competition = detectCompetitionFromTopic(normalizedTopic);

  const intent: RankingIntent = {
    kind: "ranking",
    rankingType: detectRankingType(normalizedTopic),
    competition,
    timeScope: detectRankingTimeScope(normalizedTopic, competition, season),
    ...(season != null ? { season } : {}),
    limit: detectLimit(normalizedTopic, defaultLimit),
  };

  return normalizeTop5ScorersIntent(intent, mode);
}

export function isTopScorersWorldCupIntent(intent: RankingIntent): boolean {
  return intent.rankingType === "top_scorers" && intent.competition === "fifa_world_cup";
}

export function isTopScorersRankingIntent(
  intent: RankingIntent,
  mode?: FootballResearchMode,
): boolean {
  const normalized = normalizeTop5ScorersIntent(intent, mode);
  return normalized.rankingType === "top_scorers" && normalized.competition !== "unknown";
}
