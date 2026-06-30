"use client";

import { useEffect, useMemo } from "react";

import {
  buildIdentityMismatchStaleness,
  detectSceneIdentityIndexFallbacks,
} from "@/features/editor/creator-asset-planning/creator-asset-scene-identity.utils";
import {
  readPlanningCache,
  readPlanningData,
  updatePlanningCacheStaleness,
} from "@/features/editor/creator-asset-planning/creator-asset-planning.cache";
import type { CreatorAssetStudioPlanningData } from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import {
  buildScriptHash,
} from "@/features/editor/creator-asset-planning/creator-asset-planning.utils";
import { isCreatorAssetStudioVisible } from "@/features/editor/components/creator-asset-studio/creator-asset-studio.visibility.utils";
import { SCENE_IDENTITY_MISMATCH_REASON } from "@/features/editor/story-evolution/story-evolution.types";
import type { FootieScript } from "@/features/story/types";
import type { ScriptMode } from "@/types/footiebitz";

function syncSceneIdentityStaleness(
  storyId: string,
  script: FootieScript,
  planning: CreatorAssetStudioPlanningData,
): void {
  const fallbacks = detectSceneIdentityIndexFallbacks(script, planning);
  if (fallbacks.length === 0) {
    return;
  }

  const cachedEntry = readPlanningCache(storyId);
  if (!cachedEntry) {
    return;
  }

  const existing = cachedEntry.staleness;
  if (
    existing?.reasons.includes(SCENE_IDENTITY_MISMATCH_REASON) &&
    existing.score >= 0.6 &&
    existing.affectedScopes.includes("timeline")
  ) {
    return;
  }

  updatePlanningCacheStaleness(
    storyId,
    buildIdentityMismatchStaleness(existing, true),
  );
}

/** Reads cached planning for the editor — never executes intelligence. */
export function useCreatorAssetPlanningCache(
  storyId: string | undefined,
  script: FootieScript,
  storyMode?: ScriptMode,
): CreatorAssetStudioPlanningData | null {
  const scriptHash = buildScriptHash(script);
  const sceneCount = script.scenes.length;
  const resolvedStoryMode = storyMode ?? "default";
  const sceneIdentityKey = script.scenes.map((scene) => scene.id).join("|");

  const planning = useMemo(() => {
    if (!storyId || !isCreatorAssetStudioVisible()) {
      return null;
    }

    return readPlanningData(storyId, {
      scriptHash,
      sceneCount,
      storyMode: resolvedStoryMode,
    });
  }, [storyId, scriptHash, sceneCount, resolvedStoryMode]);

  useEffect(() => {
    if (!storyId || !planning) {
      return;
    }

    syncSceneIdentityStaleness(storyId, script, planning);
  }, [storyId, planning, sceneIdentityKey, script]);

  return planning;
}

export function useCreatorAssetStudioVisible(): boolean {
  return isCreatorAssetStudioVisible();
}
