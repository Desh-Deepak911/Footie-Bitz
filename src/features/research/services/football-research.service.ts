import "server-only";

import {
  getFixtureEvents,
  getFixtureLineups,
  getFixtureStatistics,
  getPlayerSearch,
  getStandings,
  getTopScorers,
  isApiFootballConfigured,
  searchFixturesByTeam,
  searchTeams,
  type ApiFootballFixtureItem,
  type ApiFootballPlayerSearchItem,
  type ApiFootballTopScorerRanking,
} from "@/lib/football";

import type {
  FootballResearchContext,
  FootballResearchMode,
  FootballResearchPlayer,
  FootballResearchSource,
} from "@/features/research/types/football-research.types";
import type { RankingIntent } from "@/features/research/types/ranking-intent.types";

import {
  buildFixtureFact,
  buildPlayerFact,
  fixtureInvolvesTeams,
  mapApiEvents,
  mapApiFixture,
  mapApiLineups,
  mapApiPlayers,
  mapApiStandings,
  mapApiStatistics,
  mapApiTeam,
} from "../utils/api-football-mappers.utils";
import {
  inferFootballTopicKind,
  parseManualFacts,
  splitMatchTopic,
} from "../utils/topic-inference.utils";
import {
  getCompetitionLabel,
  resolveRankingSeason,
} from "../utils/competition-resolver.utils";
import {
  isTopScorersRankingIntent,
  parseRankingIntent,
} from "../utils/ranking-intent.utils";
import {
  buildTopScorersSeasonUnavailableWarning,
  buildTopScorersUnavailableWarning,
  isAllTimeWorldCupTopScorersIntent,
  resolveTopScorersLeagueId,
} from "../utils/top-scorers-research.utils";
import {
  appendFifaWorldCup2026TournamentFacts,
  buildPlayerAnalysisIntent,
  buildVerifiedPlayerFactStrings,
  pickBestPlayerSearchMatch,
} from "../utils/player-analysis.utils";
import {
  buildPlayerSearchQueries,
  parsePlayerAnalysisTopic,
} from "../utils/player-topic-parser.utils";
import { getAllTimeWorldCupTopScorers } from "../utils/world-cup-all-time-scorers.utils";
import { applyFifaWorldCup2026Grounding } from "../utils/research-grounding.utils";

export interface ResearchFootballContextInput {
  topic: string;
  mode: FootballResearchMode;
  manualContext?: string;
}

function createEmptyContext(input: {
  topic: string;
  mode: FootballResearchMode;
  manualContext?: string;
  source: FootballResearchSource;
  warnings?: string[];
  summary?: string;
}): FootballResearchContext {
  const facts = parseManualFacts(input.manualContext);

  return {
    mode: input.mode,
    topic: input.topic.trim(),
    summary: input.summary ?? `Research brief: ${input.topic.trim()}`,
    facts,
    warnings: input.warnings ?? [],
    source: input.source,
  };
}

function buildSummary(context: FootballResearchContext): string {
  if (context.rankingIntent?.rankingType === "top_scorers" && context.players?.length) {
    const competitionLabel = getCompetitionLabel(context.rankingIntent.competition);
    const timeLabel =
      context.rankingIntent.timeScope === "season" && context.rankingIntent.season
        ? `${context.rankingIntent.season}`
        : "all-time";
    return `Top ${context.players.length} goal scorers — ${competitionLabel} (${timeLabel})`;
  }

  if (context.fixture) {
    return `${context.fixture.homeTeam} vs ${context.fixture.awayTeam} — ${context.fixture.league}`;
  }

  if (context.players?.length) {
    return `Player focus: ${context.players[0]!.name}`;
  }

  if (context.teams?.length) {
    return `Team focus: ${context.teams.map((team) => team.name).join(" vs ")}`;
  }

  return `Research brief: ${context.topic}`;
}

function appendUniqueFacts(facts: string[], nextFacts: string[]): string[] {
  const seen = new Set(facts);
  for (const fact of nextFacts) {
    if (!seen.has(fact)) {
      seen.add(fact);
      facts.push(fact);
    }
  }
  return facts;
}

async function resolveTeamsFromQueries(
  queries: string[],
): Promise<Array<{ id: number; name: string; country?: string }>> {
  const teams: Array<{ id: number; name: string; country?: string }> = [];

  for (const query of queries.slice(0, 2)) {
    const results = await searchTeams(query);
    const team = results?.[0]?.team;
    if (!team) {
      continue;
    }

    if (!teams.some((entry) => entry.id === team.id)) {
      teams.push({
        id: team.id,
        name: team.name,
        country: team.country,
      });
    }
  }

  return teams;
}

function pickBestFixture(
  fixtures: ApiFootballFixtureItem[],
  teamIds: number[],
): ApiFootballFixtureItem | null {
  if (fixtures.length === 0) {
    return null;
  }

  if (teamIds.length >= 2) {
    const matched = fixtures.find((fixture) => fixtureInvolvesTeams(fixture, teamIds));
    if (matched) {
      return matched;
    }
  }

  return fixtures[0] ?? null;
}

async function fetchFixtureBundle(
  fixtureId: number,
  mode: FootballResearchMode,
): Promise<{
  statistics?: FootballResearchContext["statistics"];
  events?: FootballResearchContext["events"];
  lineups?: FootballResearchContext["lineups"];
}> {
  const needsStatistics =
    mode === "tactical_review" || mode === "match_recap" || mode === "match_preview";
  const needsEvents = mode === "tactical_review" || mode === "match_recap";
  const needsLineups = mode === "tactical_review";

  const [statisticsResult, eventsResult, lineupsResult] = await Promise.all([
    needsStatistics ? getFixtureStatistics(fixtureId) : Promise.resolve(null),
    needsEvents ? getFixtureEvents(fixtureId) : Promise.resolve(null),
    needsLineups ? getFixtureLineups(fixtureId) : Promise.resolve(null),
  ]);

  return {
    statistics: statisticsResult ? mapApiStatistics(statisticsResult) : undefined,
    events: eventsResult ? mapApiEvents(eventsResult) : undefined,
    lineups: lineupsResult ? mapApiLineups(lineupsResult) : undefined,
  };
}

async function researchMatchTopic(
  topic: string,
  mode: FootballResearchMode,
  manualContext?: string,
): Promise<FootballResearchContext> {
  const queries = splitMatchTopic(topic);
  const teams = await resolveTeamsFromQueries(queries);
  const warnings: string[] = [];

  if (teams.length === 0) {
    return createEmptyContext({
      topic,
      mode,
      manualContext,
      source: "fallback",
      warnings: ["No matching teams found in API-Football."],
    });
  }

  const primaryTeamId = teams[0]!.id;
  const teamIds = teams.map((team) => team.id);
  const fixtureDirection = mode === "match_preview" ? "next" : "last";
  const fixtures =
    (await searchFixturesByTeam(primaryTeamId, {
      [fixtureDirection]: mode === "match_preview" ? 3 : 1,
    })) ?? [];

  const selectedFixture = pickBestFixture(fixtures, teamIds);
  const context = createEmptyContext({
    topic,
    mode,
    manualContext,
    source: "api-football",
    warnings,
  });

  context.teams = teams.map((team) => ({
    id: team.id,
    name: team.name,
    country: team.country,
  }));

  if (!selectedFixture) {
    context.warnings.push("No recent fixture found for the matched teams.");
    context.summary = buildSummary(context);
    return context;
  }

  context.fixture = mapApiFixture(selectedFixture);
  appendUniqueFacts(context.facts, [buildFixtureFact(context.fixture)]);

  const bundle = await fetchFixtureBundle(selectedFixture.fixture.id, mode);
  context.statistics = bundle.statistics;
  context.events = bundle.events;
  context.lineups = bundle.lineups;

  if (bundle.events?.length) {
    appendUniqueFacts(
      context.facts,
      bundle.events
        .filter((event) => event.type?.toLowerCase() === "goal")
        .slice(0, 5)
        .map((event) => {
          const minute = event.minute != null ? `${event.minute}'` : "";
          return `${minute} ${event.team}${event.player ? `: ${event.player}` : ""} (${event.type})`.trim();
        }),
    );
  }

  const leagueId = selectedFixture.league.id;
  const season = selectedFixture.league.season;
  if ((mode === "match_preview" || mode === "top_5") && leagueId && season) {
    const standingsResult = await getStandings(leagueId, season);
    if (standingsResult?.[0]) {
      context.standings = [mapApiStandings(standingsResult[0])];
    } else {
      context.warnings.push("Standings unavailable from provider.");
    }
  }

  context.summary = buildSummary(context);
  return context;
}

async function researchPlayerTopic(
  topic: string,
  mode: FootballResearchMode,
  manualContext?: string,
): Promise<FootballResearchContext> {
  const parsed = parsePlayerAnalysisTopic(topic);
  const playerAnalysisIntent = buildPlayerAnalysisIntent(parsed);

  const context = createEmptyContext({
    topic,
    mode,
    manualContext,
    source: "api-football",
  });
  context.playerAnalysisIntent = playerAnalysisIntent;

  if (playerAnalysisIntent.competitionKey === "fifa_world_cup_2026") {
    appendFifaWorldCup2026TournamentFacts(context, playerAnalysisIntent);
  }

  const searchQueries = buildPlayerSearchQueries(parsed.playerName);
  let matchedItem: ApiFootballPlayerSearchItem | null = null;

  for (const query of searchQueries) {
    const playersResult = await getPlayerSearch(query);
    if (!playersResult?.length) {
      continue;
    }

    matchedItem = pickBestPlayerSearchMatch(parsed.playerName, playersResult);
    if (matchedItem) {
      break;
    }
  }

  if (!matchedItem) {
    context.source = context.facts.length > 0 ? "static-fallback" : "fallback";
    context.warnings.push(
      parsed.playerName
        ? `No matching players found in API-Football for "${parsed.playerName}".`
        : "No player name detected in topic.",
    );
    context.summary = parsed.playerName
      ? `Player focus: ${parsed.playerName}`
      : buildSummary(context);
    return context;
  }

  const [primaryPlayer] = mapApiPlayers([matchedItem]);
  if (!primaryPlayer) {
    context.source = context.facts.length > 0 ? "static-fallback" : "fallback";
    context.warnings.push("Player search returned an unreadable profile.");
    context.summary = parsed.playerName
      ? `Player focus: ${parsed.playerName}`
      : buildSummary(context);
    return context;
  }

  context.players = [primaryPlayer];
  appendUniqueFacts(context.facts, buildVerifiedPlayerFactStrings(primaryPlayer));
  context.summary = `Player focus: ${primaryPlayer.name}`;
  return context;
}

function mapTopScorerRankingsToPlayers(
  rankings: ApiFootballTopScorerRanking[],
  limit: number,
  leagueLabel: string,
  season: number,
): FootballResearchPlayer[] {
  return rankings.slice(0, limit).map((entry) => ({
    id: entry.rank,
    name: entry.playerName,
    team: entry.teamName || undefined,
    league: leagueLabel,
    season,
    goals: entry.goals,
    assists: entry.assists ?? null,
    ...(entry.appearances != null ? { appearances: entry.appearances } : {}),
    ...(entry.raw.player.nationality ? { nationality: entry.raw.player.nationality } : {}),
  }));
}

function buildAllTimeWorldCupTopScorersContext(
  intent: RankingIntent,
  topic: string,
  mode: FootballResearchMode,
  manualContext?: string,
): FootballResearchContext {
  const context = createEmptyContext({
    topic,
    mode,
    manualContext,
    source: "static-fallback",
  });
  context.rankingIntent = intent;

  const rankedPlayers = getAllTimeWorldCupTopScorers(intent.limit);
  context.players = rankedPlayers;
  appendUniqueFacts(
    context.facts,
    rankedPlayers.map((player, index) => `#${index + 1} ${buildPlayerFact(player)}`),
  );
  context.warnings.push("Using curated all-time World Cup record fallback.");
  context.summary = buildSummary(context);
  return context;
}

async function researchTopScorersRanking(
  intent: RankingIntent,
  topic: string,
  mode: FootballResearchMode,
  manualContext?: string,
): Promise<FootballResearchContext | null> {
  if (intent.competition === "unknown") {
    return null;
  }

  if (isAllTimeWorldCupTopScorersIntent(intent)) {
    return buildAllTimeWorldCupTopScorersContext(intent, topic, mode, manualContext);
  }

  const leagueId = resolveTopScorersLeagueId(intent);
  if (leagueId == null) {
    return null;
  }

  const season = resolveRankingSeason(intent);
  if (season == null) {
    const context = createEmptyContext({
      topic,
      mode,
      manualContext,
      source: "fallback",
      warnings: [buildTopScorersSeasonUnavailableWarning(intent)],
    });
    context.rankingIntent = intent;
    context.summary = buildSummary(context);
    return context;
  }

  const competitionLabel = getCompetitionLabel(intent.competition);
  const resolvedIntent: RankingIntent = {
    ...intent,
    timeScope: "season",
    season,
  };

  const topscorersResult = await getTopScorers({ leagueId, season });
  const context = createEmptyContext({
    topic,
    mode,
    manualContext,
    source: "api-football",
  });
  context.rankingIntent = resolvedIntent;

  if (topscorersResult?.length) {
    const rankedPlayers = mapTopScorerRankingsToPlayers(
      topscorersResult,
      intent.limit,
      competitionLabel,
      season,
    );
    context.players = rankedPlayers;
    appendUniqueFacts(
      context.facts,
      rankedPlayers.map((player, index) => `#${index + 1} ${buildPlayerFact(player)}`),
    );
    context.summary = buildSummary(context);
    return context;
  }

  context.source = "fallback";
  context.warnings.push(buildTopScorersUnavailableWarning(resolvedIntent));
  context.summary = buildSummary(context);
  return context;
}

async function researchLegacyTopListTopic(
  topic: string,
  mode: FootballResearchMode,
  manualContext?: string,
  rankingIntent?: RankingIntent,
): Promise<FootballResearchContext> {
  const [teamsResult, playersResult] = await Promise.all([
    searchTeams(topic),
    getPlayerSearch(topic),
  ]);

  const context = createEmptyContext({
    topic,
    mode,
    manualContext,
    source: "api-football",
  });
  if (rankingIntent) {
    context.rankingIntent = rankingIntent;
  }

  if (teamsResult?.[0]) {
    context.teams = [mapApiTeam(teamsResult[0])];
    const fixtures =
      (await searchFixturesByTeam(context.teams[0]!.id, { last: 1 })) ?? [];
    const latestFixture = fixtures[0];

    if (latestFixture) {
      context.fixture = mapApiFixture(latestFixture);
      appendUniqueFacts(context.facts, [buildFixtureFact(context.fixture)]);

      const leagueId = latestFixture.league.id;
      const season = latestFixture.league.season;
      if (leagueId && season) {
        const standingsResult = await getStandings(leagueId, season);
        if (standingsResult?.[0]) {
          context.standings = [mapApiStandings(standingsResult[0])];
        }
      }
    }
  }

  if (playersResult?.length) {
    const rankedPlayers = mapApiPlayers(playersResult)
      .sort((left, right) => (right.goals ?? 0) - (left.goals ?? 0))
      .slice(0, 5);
    context.players = rankedPlayers;
    appendUniqueFacts(
      context.facts,
      rankedPlayers.map((player, index) => `#${index + 1} ${buildPlayerFact(player)}`),
    );
  }

  if (!context.standings?.length && !context.players?.length) {
    context.source = "fallback";
    context.warnings.push("No ranking data available from provider.");
  }

  context.summary = buildSummary(context);
  return context;
}

async function researchTopListTopic(
  topic: string,
  mode: FootballResearchMode,
  manualContext?: string,
): Promise<FootballResearchContext> {
  const rankingIntent = mode === "top_5" ? parseRankingIntent(topic, 5, mode) : undefined;

  if (rankingIntent && isTopScorersRankingIntent(rankingIntent, mode)) {
    const rankedContext = await researchTopScorersRanking(rankingIntent, topic, mode, manualContext);
    if (rankedContext) {
      return rankedContext;
    }
  }

  return researchLegacyTopListTopic(topic, mode, manualContext, rankingIntent);
}

async function researchGeneralTopic(
  topic: string,
  mode: FootballResearchMode,
  manualContext?: string,
): Promise<FootballResearchContext> {
  const [teamsResult, playersResult] = await Promise.all([
    searchTeams(topic),
    getPlayerSearch(topic),
  ]);

  const context = createEmptyContext({
    topic,
    mode,
    manualContext,
    source: "api-football",
  });

  if (teamsResult?.length) {
    context.teams = teamsResult.slice(0, 2).map(mapApiTeam);
    appendUniqueFacts(
      context.facts,
      context.teams.map((team) => `${team.name}${team.country ? ` (${team.country})` : ""}`),
    );

    const fixtures =
      (await searchFixturesByTeam(context.teams[0]!.id, { last: 1 })) ?? [];
    if (fixtures[0]) {
      context.fixture = mapApiFixture(fixtures[0]);
      appendUniqueFacts(context.facts, [buildFixtureFact(context.fixture)]);
    }
  }

  if (playersResult?.length) {
    context.players = mapApiPlayers(playersResult.slice(0, 2));
    appendUniqueFacts(
      context.facts,
      context.players.map((player) => buildPlayerFact(player)),
    );
  }

  if (!context.teams?.length && !context.players?.length && !context.fixture) {
    return createEmptyContext({
      topic,
      mode,
      manualContext,
      source: "fallback",
      warnings: ["No matching teams or players found in API-Football."],
    });
  }

  context.summary = buildSummary(context);
  return context;
}

/**
 * Researches football context for script enrichment.
 * Never throws — always returns a FootballResearchContext suitable for fallback generation.
 */
export async function researchFootballContext(
  input: ResearchFootballContextInput,
): Promise<FootballResearchContext> {
  const topic = input.topic.trim();
  const manualContext = input.manualContext?.trim() || undefined;

  if (!topic) {
    return createEmptyContext({
      topic: "",
      mode: input.mode,
      manualContext,
      source: "fallback",
      warnings: ["Topic is required for football research."],
    });
  }

  if (input.mode === "top_5") {
    const rankingIntent = parseRankingIntent(topic, 5, input.mode);
    if (isAllTimeWorldCupTopScorersIntent(rankingIntent)) {
      return buildAllTimeWorldCupTopScorersContext(rankingIntent, topic, input.mode, manualContext);
    }
  }

  if (!isApiFootballConfigured()) {
    return applyFifaWorldCup2026Grounding(
      createEmptyContext({
        topic,
        mode: input.mode,
        manualContext,
        source: manualContext ? "manual" : "fallback",
        warnings: manualContext
          ? ["API_FOOTBALL_KEY is not configured — using manual context only."]
          : ["API_FOOTBALL_KEY is not configured."],
      }),
    );
  }

  try {
    const topicKind = inferFootballTopicKind(topic, input.mode);

    switch (topicKind) {
      case "match":
        return applyFifaWorldCup2026Grounding(
          await researchMatchTopic(topic, input.mode, manualContext),
        );
      case "player":
        return applyFifaWorldCup2026Grounding(
          await researchPlayerTopic(topic, input.mode, manualContext),
        );
      case "top_list":
        return applyFifaWorldCup2026Grounding(
          await researchTopListTopic(topic, input.mode, manualContext),
        );
      case "team":
      default:
        return applyFifaWorldCup2026Grounding(
          await researchGeneralTopic(topic, input.mode, manualContext),
        );
    }
  } catch (error) {
    return applyFifaWorldCup2026Grounding(
      createEmptyContext({
        topic,
        mode: input.mode,
        manualContext,
        source: manualContext ? "manual" : "fallback",
        warnings: [
          error instanceof Error ? error.message : "Football research failed.",
        ],
      }),
    );
  }
}
