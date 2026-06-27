import type {
  ApiFootballFixtureEvent,
  ApiFootballFixtureEventsResponse,
  ApiFootballFixtureItem,
  ApiFootballFixtureLineup,
  ApiFootballFixtureStatistics,
  ApiFootballPlayerSearchItem,
  ApiFootballStandingsResponse,
  ApiFootballTeam,
} from "@/lib/football";
import type {
  FootballResearchEvent,
  FootballResearchFixture,
  FootballResearchLineup,
  FootballResearchPlayer,
  FootballResearchStandings,
  FootballResearchStatistic,
  FootballResearchTeam,
} from "@/features/research/types/football-research.types";

export function mapApiTeam(entry: ApiFootballTeam): FootballResearchTeam {
  return {
    id: entry.team.id,
    name: entry.team.name,
    country: entry.team.country,
  };
}

export function mapApiFixture(entry: ApiFootballFixtureItem): FootballResearchFixture {
  return {
    id: entry.fixture.id,
    date: entry.fixture.date,
    status: entry.fixture.status?.short ?? entry.fixture.status?.long,
    league: entry.league.name,
    season: entry.league.season,
    round: entry.league.round,
    homeTeam: entry.teams.home.name,
    awayTeam: entry.teams.away.name,
    homeGoals: entry.goals.home,
    awayGoals: entry.goals.away,
  };
}

export function mapApiStatistics(
  entries: ApiFootballFixtureStatistics[],
): FootballResearchStatistic[] {
  const mapped: FootballResearchStatistic[] = [];

  for (const entry of entries) {
    for (const stat of entry.statistics) {
      mapped.push({
        team: entry.team.name,
        type: stat.type,
        value: stat.value,
      });
    }
  }

  return mapped;
}

export function mapApiEvent(event: ApiFootballFixtureEvent): FootballResearchEvent {
  return {
    minute: event.time.elapsed ?? undefined,
    extraMinute: event.time.extra ?? null,
    team: event.team.name,
    player: event.player?.name ?? undefined,
    assist: event.assist?.name ?? undefined,
    type: event.type,
    detail: event.detail ?? undefined,
  };
}

export function mapApiEvents(
  responses: ApiFootballFixtureEventsResponse[] | null | undefined,
): FootballResearchEvent[] {
  if (!responses?.length) {
    return [];
  }

  return responses.flatMap((response) => response.events.map(mapApiEvent));
}

export function mapApiLineups(lineups: ApiFootballFixtureLineup[]): FootballResearchLineup[] {
  return lineups.map((lineup) => ({
    team: lineup.team.name,
    formation: lineup.formation,
    startingXi: lineup.startXI.map((entry) => entry.player.name),
    substitutes: lineup.substitutes.map((entry) => entry.player.name),
  }));
}

export function mapApiStandings(response: ApiFootballStandingsResponse): FootballResearchStandings {
  const table = response.standings[0] ?? [];

  return {
    league: response.league.name,
    season: response.league.season,
    rows: table.map((row) => ({
      rank: row.rank,
      team: row.team.name,
      points: row.points,
      played: row.all.played,
      wins: row.all.win,
      draws: row.all.draw,
      losses: row.all.lose,
      goalsFor: row.all.goals.for,
      goalsAgainst: row.all.goals.against,
      goalDifference: row.goalsDiff,
      form: row.form,
    })),
  };
}

export function mapApiPlayers(entries: ApiFootballPlayerSearchItem[]): FootballResearchPlayer[] {
  return entries.map((entry) => {
    const primaryStats = entry.statistics?.[0];

    return {
      id: entry.player.id,
      name: entry.player.name,
      nationality: entry.player.nationality,
      team: primaryStats?.team?.name,
      league: primaryStats?.league?.name,
      season: primaryStats?.league?.season,
      appearances: primaryStats?.games?.appearences,
      goals: primaryStats?.goals?.total ?? null,
      assists: primaryStats?.goals?.assists ?? null,
      position: primaryStats?.games?.position,
      rating: primaryStats?.games?.rating,
    };
  });
}

export function fixtureInvolvesTeams(
  fixture: ApiFootballFixtureItem,
  teamIds: number[],
): boolean {
  if (teamIds.length === 0) {
    return true;
  }

  const fixtureTeamIds = [fixture.teams.home.id, fixture.teams.away.id];
  return teamIds.every((teamId) => fixtureTeamIds.includes(teamId));
}

export function buildFixtureFact(fixture: FootballResearchFixture): string {
  const score =
    fixture.homeGoals != null && fixture.awayGoals != null
      ? `${fixture.homeGoals}-${fixture.awayGoals}`
      : "score TBD";
  return `${fixture.homeTeam} ${score} ${fixture.awayTeam} (${fixture.league})`;
}

export function buildPlayerFact(player: FootballResearchPlayer): string {
  const stats = [
    player.goals != null ? `${player.goals} goals` : null,
    player.assists != null ? `${player.assists} assists` : null,
    player.appearances != null ? `${player.appearances} apps` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return stats ? `${player.name}: ${stats}` : player.name;
}
