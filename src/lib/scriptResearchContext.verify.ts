/**
 * Script research context resolution (run: npm run test:script-research-context).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  applyResolvedResearchContext,
  isReusableResearchPreview,
} from "@/features/research/utils/script-research-context.utils";
import type { FootballResearchContext } from "@/features/research/types/football-research.types";
import type { GenerateScriptResearchPreview } from "@/types/footiebitz";

function test(name: string, fn: () => void) {
  fn();
  console.log(`  ✓ ${name}`);
}

const root = process.cwd();

function readSrc(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const worldCupPreviewContext: FootballResearchContext = {
  mode: "top_5",
  topic: "top 5 highest goal scorers fifa world cup",
  summary: "All-time World Cup top scorers",
  facts: ["Miroslav Klose leads with 16 goals."],
  players: [
    { id: 1, name: "Miroslav Klose", nationality: "Germany", goals: 16 },
    { id: 2, name: "Ronaldo Nazário", nationality: "Brazil", goals: 15 },
  ],
  warnings: ["Using curated all-time World Cup record fallback."],
  source: "static-fallback",
};

const previewPayload: GenerateScriptResearchPreview = {
  topic: "top 5 highest goal scorers fifa world cup",
  mode: "top_5",
  researchContext: worldCupPreviewContext,
  contextText: [
    "RESEARCHED FOOTBALL CONTEXT",
    "",
    "RANKED PLAYER DATA:",
    "1. Miroslav Klose — Germany — 16 goals",
  ].join("\n"),
};

console.log("scriptResearchContext");

test("isReusableResearchPreview requires matching topic and mode", () => {
  assert.equal(
    isReusableResearchPreview(previewPayload, {
      topic: previewPayload.topic,
      scriptMode: "top_5",
    }),
    true,
  );
  assert.equal(
    isReusableResearchPreview(previewPayload, {
      topic: "different topic",
      scriptMode: "top_5",
    }),
    false,
  );
  assert.equal(
    isReusableResearchPreview(previewPayload, {
      topic: previewPayload.topic,
      scriptMode: "story",
    }),
    false,
  );
});

test("applyResolvedResearchContext merges manual notes with preview context", () => {
  const resolved = applyResolvedResearchContext({
    scriptMode: "top_5",
    manualContext: "Manual xG note",
    researchContext: worldCupPreviewContext,
    contextText: previewPayload.contextText,
    usedResearchPreview: true,
  });

  assert.equal(resolved.usedResearchPreview, true);
  assert.equal(resolved.researchApplied, true);
  assert.equal(resolved.top5RankedDataAvailable, true);
  assert.match(resolved.context ?? "", /Manual xG note/);
  assert.match(resolved.context ?? "", /RANKED PLAYER DATA/);
});

test("applyResolvedResearchContext sets top5RankedDataAvailable false without ranked players", () => {
  const resolved = applyResolvedResearchContext({
    scriptMode: "top_5",
    researchContext: {
      mode: "top_5",
      topic: "Top 5 Premier League strikers",
      summary: "No rankings",
      facts: [],
      warnings: ["No ranked player data found."],
      source: "fallback",
    },
    contextText: "RESEARCHED FOOTBALL CONTEXT\n\nWarnings:\n- No ranked player data found.",
  });

  assert.equal(resolved.researchApplied, false);
  assert.equal(resolved.top5RankedDataAvailable, false);
});

test("failed research keeps manual context and marks not applied", () => {
  const resolved = applyResolvedResearchContext({
    scriptMode: "player_analysis",
    manualContext: "Focus on Portugal captaincy",
    researchContext: {
      mode: "player_analysis",
      topic: "Cristiano Ronaldo FIFA World Cup 2026",
      summary: "Research brief",
      facts: [],
      warnings: ["No player data found."],
      source: "fallback",
    },
    contextText: "RESEARCHED FOOTBALL CONTEXT\n\nWarnings:\n- No player data found.",
    usedResearchPreview: false,
  });

  assert.equal(resolved.researchApplied, false);
  assert.equal(resolved.context, "Focus on Portugal captaincy");
  assert.match(resolved.researchWarning ?? "", /No player data found/);
});

test("generate-script route passes top5RankedDataAvailable to generation", () => {
  const route = readSrc("src/app/api/generate-script/route.ts");
  assert.match(route, /researchPreview/);
  assert.match(route, /resolveScriptResearchContext/);
  assert.match(route, /researchAttemptedWithoutData/);
  assert.match(route, /top5RankedDataAvailable/);
});

test("CreateStoryFlow sends researchPreview on generate", () => {
  const flow = readSrc("src/features/create/components/CreateStoryFlow.tsx");
  assert.match(flow, /buildGenerateScriptResearchPreview/);
  assert.match(flow, /researchPreview:/);
});

console.log("\nAll script research context checks passed.");
