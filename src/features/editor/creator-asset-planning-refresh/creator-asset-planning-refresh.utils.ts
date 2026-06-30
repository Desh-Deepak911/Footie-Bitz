import { getCanonicalVoiceover } from "@/features/audio";
import { buildCreatorAssetPlanningSnapshotForGeneratedScenes } from "@/features/editor/creator-asset-planning/creator-asset-planning-generation.utils";
import type { CreatorAssetPlanningCacheEntry } from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import type { CreatorAssetPlanningSnapshot } from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import { buildScriptHash } from "@/features/editor/creator-asset-planning/creator-asset-planning.utils";
import type { FootieScript } from "@/features/story/types";
import { resolveSceneCount, resolveScriptMode } from "@/types/footiebitz";

import type {
  CreatorAssetPlanningRefreshDiagnostics,
  CreatorAssetPlanningRefreshInput,
  CreatorAssetPlanningRefreshScope,
} from "./creator-asset-planning-refresh.types";

/** v1 maps every requested scope to a full planning rebuild. */
export const CREATOR_ASSET_PLANNING_REFRESH_EFFECTIVE_SCOPE: CreatorAssetPlanningRefreshScope =
  "full";

export function resolveRefreshTopic(input: CreatorAssetPlanningRefreshInput): string {
  return input.topic?.trim() || input.script.title.trim();
}

export function resolveRefreshVoiceoverDurationMs(script: FootieScript): number {
  const canonical = getCanonicalVoiceover(script);
  const fromScript = script.voiceoverDurationMs ?? canonical?.durationMs;
  if (typeof fromScript === "number" && Number.isFinite(fromScript) && fromScript > 0) {
    return Math.round(fromScript);
  }

  const fromTotalDuration = Math.round((script.totalDuration ?? 0) * 1000);
  if (fromTotalDuration > 0) {
    return fromTotalDuration;
  }

  const sceneDurationMs = script.scenes.reduce(
    (total, scene) => total + Math.round((scene.duration ?? 0) * 1000),
    0,
  );
  if (sceneDurationMs > 0) {
    return sceneDurationMs;
  }

  throw new Error("asset planning requires a valid voiceover duration");
}

export function assertRefreshInput(input: CreatorAssetPlanningRefreshInput): void {
  const topic = resolveRefreshTopic(input);
  const narration = input.script.narration.trim();

  if (!topic) {
    throw new Error("asset planning requires a topic");
  }

  if (!narration) {
    throw new Error("asset planning requires narration");
  }

  if (input.script.scenes.length === 0) {
    throw new Error("asset planning requires generated scenes");
  }

  resolveRefreshVoiceoverDurationMs(input.script);
}

export function buildRefreshDiagnostics(
  input: CreatorAssetPlanningRefreshInput,
  previousEntry: CreatorAssetPlanningCacheEntry | null,
  script: FootieScript,
): Omit<
  CreatorAssetPlanningRefreshDiagnostics,
  "effectiveScope" | "cacheReplaced" | "durationMs" | "refreshedAt" | "newScriptHash"
> {
  const storyMode = resolveScriptMode(input.storyMode);

  return {
    storyId: input.storyId,
    requestedScope: input.scope,
    reason: input.reason,
    sceneIndex: input.sceneIndex,
    sceneId: input.sceneId,
    sceneCount: script.scenes.length,
    storyMode,
    previousScriptHash: previousEntry?.scriptHash,
    hadPreviousCache: Boolean(previousEntry),
  };
}

/** Builds fresh planning from the current script using existing generation utilities. */
export function buildRefreshedPlanningSnapshot(
  input: CreatorAssetPlanningRefreshInput,
): CreatorAssetPlanningSnapshot {
  const topic = resolveRefreshTopic(input);
  const narration = input.script.narration.trim();
  const scriptMode = resolveScriptMode(input.storyMode);
  const voiceoverDurationMs = resolveRefreshVoiceoverDurationMs(input.script);

  return buildCreatorAssetPlanningSnapshotForGeneratedScenes({
    script: input.script,
    scenes: input.script.scenes,
    title: input.script.title.trim() || topic,
    narration,
    topic,
    scriptMode,
    sceneCount: resolveSceneCount(input.script.scenes.length),
    voiceoverDurationMs,
  });
}

/** Clones script for immutability checks — refresh must not mutate input. */
export function cloneScriptForRefreshCheck(script: FootieScript): FootieScript {
  return structuredClone(script);
}

export function scriptsEqualForRefresh(left: FootieScript, right: FootieScript): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function resolveRefreshScriptHash(script: FootieScript): string {
  return buildScriptHash(script);
}
