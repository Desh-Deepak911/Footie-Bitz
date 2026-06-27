import type {
  ApiFootballFixtureItem,
  ApiFootballFixtureStatistics,
  ApiFootballPlayerSearchItem,
} from "@/lib/football";

function formatFixtureLine(fixture: ApiFootballFixtureItem): string {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const homeGoals = fixture.goals.home ?? "?";
  const awayGoals = fixture.goals.away ?? "?";
  const date = fixture.fixture.date.slice(0, 10);
  const status = fixture.fixture.status?.short ?? "";
  const league = fixture.league.name;
  const round = fixture.league.round ? ` · ${fixture.league.round}` : "";

  return `${home} ${homeGoals}-${awayGoals} ${away} (${date}${status ? ` · ${status}` : ""}) — ${league}${round}`;
}

function formatStatisticsBlock(stats: ApiFootballFixtureStatistics[]): string {
  if (stats.length === 0) {
    return "";
  }

  const lines: string[] = [];
  const statTypes = new Set<string>();

  for (const entry of stats) {
    for (const stat of entry.statistics) {
      statTypes.add(stat.type);
    }
  }

  const orderedTypes = [...statTypes].slice(0, 12);

  for (const type of orderedTypes) {
    const values = stats.map((entry) => {
      const match = entry.statistics.find((stat) => stat.type === type);
      const value = match?.value;
      return value == null || value === "" ? "—" : String(value);
    });

    if (values.every((value) => value === "—")) {
      continue;
    }

    lines.push(`- ${type}: ${stats[0]?.team.name ?? "Home"} ${values[0]} · ${stats[1]?.team.name ?? "Away"} ${values[1] ?? "—"}`);
  }

  return lines.join("\n");
}

export function formatFixtureResearchContext(input: {
  topic: string;
  teams: Array<{ id: number; name: string; country?: string }>;
  recentFixtures: ApiFootballFixtureItem[];
  fixtureStatistics?: ApiFootballFixtureStatistics[];
}): string {
  const lines: string[] = [
    "Source: API-Football (auto-researched — use these facts accurately in the script).",
    `Brief: ${input.topic.trim()}`,
  ];

  if (input.teams.length > 0) {
    lines.push(
      "",
      "Teams identified:",
      ...input.teams.map((team) => `- ${team.name}${team.country ? ` (${team.country})` : ""}`),
    );
  }

  if (input.recentFixtures.length > 0) {
    lines.push("", "Recent fixtures:");
    for (const fixture of input.recentFixtures.slice(0, 3)) {
      lines.push(`- ${formatFixtureLine(fixture)}`);
    }
  }

  if (input.fixtureStatistics && input.fixtureStatistics.length > 0) {
    const statsBlock = formatStatisticsBlock(input.fixtureStatistics);
    if (statsBlock) {
      lines.push("", "Latest fixture statistics:", statsBlock);
    }
  }

  return lines.join("\n");
}

export function formatPlayerResearchContext(input: {
  topic: string;
  players: ApiFootballPlayerSearchItem[];
}): string {
  const lines: string[] = [
    "Source: API-Football (auto-researched — use these facts accurately in the script).",
    `Brief: ${input.topic.trim()}`,
    "",
    "Players identified:",
  ];

  for (const entry of input.players.slice(0, 3)) {
    const player = entry.player;
    lines.push(`- ${player.name}${player.nationality ? ` (${player.nationality})` : ""}`);

    const primaryStats = entry.statistics?.[0];
    if (!primaryStats) {
      continue;
    }

    const team = primaryStats.team?.name;
    const league = primaryStats.league?.name;
    const season = primaryStats.league?.season;
    const games = primaryStats.games;
    const goals = primaryStats.goals;

    if (team || league) {
      lines.push(
        `  Club/league: ${[team, league, season ? `season ${season}` : null].filter(Boolean).join(" · ")}`,
      );
    }

    const statParts: string[] = [];
    if (games?.appearences != null) {
      statParts.push(`${games.appearences} apps`);
    }
    if (goals?.total != null) {
      statParts.push(`${goals.total} goals`);
    }
    if (goals?.assists != null) {
      statParts.push(`${goals.assists} assists`);
    }
    if (games?.rating) {
      statParts.push(`rating ${games.rating}`);
    }
    if (games?.position) {
      statParts.push(`position ${games.position}`);
    }

    if (statParts.length > 0) {
      lines.push(`  Season snapshot: ${statParts.join(" · ")}`);
    }
  }

  return lines.join("\n");
}
