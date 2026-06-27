/**
 * Football research service verification (run: npm run test:football-research-service).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { inferFootballTopicKind, splitMatchTopic } from "@/features/research/utils/topic-inference.utils";
import { parseRankingIntent } from "@/features/research/utils/ranking-intent.utils";

function test(name: string, fn: () => void) {
  fn();
  console.log(`  ✓ ${name}`);
}

const root = process.cwd();

function readSrc(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

console.log("footballResearchService");

test("topic inference treats vs/v topics as match", () => {
  assert.equal(inferFootballTopicKind("Arsenal vs Chelsea", "story"), "match");
  assert.equal(inferFootballTopicKind("Arsenal v Chelsea", "story"), "match");
  assert.deepEqual(splitMatchTopic("Arsenal vs Chelsea"), ["Arsenal", "Chelsea"]);
});

test("topic inference uses mode for player and top list", () => {
  assert.equal(inferFootballTopicKind("Haaland", "player_analysis"), "player");
  assert.equal(inferFootballTopicKind("Best strikers", "top_5"), "top_list");
});

test("research service routes top_5 world cup scorers through ranking intent", () => {
  const service = readSrc("src/features/research/services/football-research.service.ts");
  assert.match(service, /parseRankingIntent/);
  assert.match(service, /resolveCompetitionFromTopic/);
  assert.match(service, /resolveRankingSeason/);
  assert.match(service, /researchTopScorersRanking/);
  assert.match(service, /buildAllTimeWorldCupTopScorersContext/);
  assert.match(service, /static-fallback/);
  assert.match(service, /Using curated all-time World Cup record fallback\./);
});

test("ranking intent parses world cup top scorers brief", () => {
  const intent = parseRankingIntent("top 5 highest goal scorers fifa world cup");
  assert.equal(intent.kind, "ranking");
  assert.equal(intent.rankingType, "top_scorers");
  assert.equal(intent.competition, "fifa_world_cup");
  assert.equal(intent.timeScope, "all_time");
  assert.equal(intent.limit, 5);
});

test("research service resolves all-time world cup scorers before API check", () => {
  const service = readSrc("src/features/research/services/football-research.service.ts");
  assert.match(service, /isTopScorersWorldCupIntent\(rankingIntent\) && rankingIntent\.timeScope === "all_time"/);
  assert.match(service, /return buildAllTimeWorldCupTopScorersContext\(rankingIntent, topic, input\.mode, manualContext\)/);
});

test("research service is server-only and never throws to callers", () => {
  const service = readSrc("src/features/research/services/football-research.service.ts");
  assert.match(service, /import "server-only"/);
  assert.match(service, /export async function researchFootballContext/);
  assert.match(service, /isApiFootballConfigured/);
  assert.match(service, /Never throws/);
  assert.doesNotMatch(service, /throw new Error/);
});

test("legacy football adapter delegates to research feature", () => {
  const adapter = readSrc("src/features/football/services/football-research.service.ts");
  assert.match(adapter, /@\/features\/research/);
  assert.match(adapter, /buildFootballResearchContextText/);
});

test("research service routes player_analysis through topic parser", () => {
  const service = readSrc("src/features/research/services/football-research.service.ts");
  assert.match(service, /parsePlayerAnalysisTopic/);
  assert.match(service, /playerAnalysisIntent/);
  assert.match(service, /buildVerifiedPlayerFactStrings/);
});

console.log("\nAll football research service checks passed.");
