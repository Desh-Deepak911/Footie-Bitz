/**
 * Competition resolver verification (run: npm run test:competition-resolver).
 */
import assert from "node:assert/strict";

import {
  detectRankingSeasonFromTopic,
  getCompetitionLeagueId,
  resolveCompetitionFromTopic,
  resolveRankingSeason,
} from "@/features/research/utils/competition-resolver.utils";
import { parseRankingIntent } from "@/features/research/utils/ranking-intent.utils";
import { resolveConfiguredSeason } from "@/lib/football/season.utils";

function test(name: string, fn: () => void) {
  fn();
  console.log(`  ✓ ${name}`);
}

console.log("competitionResolver");

test("maps common competitions to API-Football league ids", () => {
  assert.equal(resolveCompetitionFromTopic("top scorers premier league").leagueId, 39);
  assert.equal(resolveCompetitionFromTopic("la liga golden boot").leagueId, 140);
  assert.equal(resolveCompetitionFromTopic("serie a top scorers").leagueId, 135);
  assert.equal(resolveCompetitionFromTopic("bundesliga most goals").leagueId, 78);
  assert.equal(resolveCompetitionFromTopic("ligue 1 goal scorers").leagueId, 61);
  assert.equal(resolveCompetitionFromTopic("champions league top scorers").leagueId, 2);
  assert.equal(resolveCompetitionFromTopic("fifa world cup 2022 scorers").leagueId, 1);
});

test("premier league without year uses season scope and configured season", () => {
  const intent = parseRankingIntent("top 5 scorers premier league");
  assert.equal(intent.competition, "premier_league");
  assert.equal(intent.timeScope, "season");
  assert.equal(intent.season, undefined);
  assert.equal(resolveRankingSeason(intent), resolveConfiguredSeason());
});

test("topic year overrides configured season", () => {
  const intent = parseRankingIntent("top scorers premier league 2023");
  assert.equal(intent.season, 2023);
  assert.equal(intent.timeScope, "season");
  assert.equal(resolveRankingSeason(intent), 2023);
  assert.equal(detectRankingSeasonFromTopic("premier league 2023"), 2023);
});

test("all-time world cup stays on static fallback path", () => {
  const intent = parseRankingIntent("top 5 highest goal scorers fifa world cup");
  assert.equal(intent.competition, "fifa_world_cup");
  assert.equal(intent.timeScope, "all_time");
  assert.equal(resolveRankingSeason(intent), undefined);
  assert.equal(getCompetitionLeagueId("fifa_world_cup"), 1);
});

test("world cup with year uses season-specific API data", () => {
  const intent = parseRankingIntent("top 10 goal scorers world cup 2022");
  assert.equal(intent.competition, "fifa_world_cup");
  assert.equal(intent.timeScope, "season");
  assert.equal(intent.season, 2022);
  assert.equal(resolveRankingSeason(intent), 2022);
});

console.log("\nAll competition resolver checks passed.");
