import type { AssetProviderResult } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { SceneRecommendation } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";
import type { CreatorAssetStudioPlanningData } from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import { CREATOR_ASSET_PLANNING_VERSION } from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import type { FootieScript } from "@/features/story/types";

import { mergeIdentityMismatchStaleness } from "@/features/editor/story-evolution/story-identity-staleness.utils";
import {
  SCENE_IDENTITY_MISMATCH_REASON,
  type PlanningStaleness,
} from "@/features/editor/story-evolution/story-evolution.types";

export type ScenePlanningLookupMethod = "scene_id" | "scene_index" | "none";

/** Metadata describing how a planning row was resolved for a scene. */
export interface ScenePlanningIdentityContext {
  sceneId: string;
  sceneIndex: number;
  sourcePlanningVersion: string;
  lookupMethod: ScenePlanningLookupMethod;
  usedIndexFallback: boolean;
}

/** Resolved planning value plus identity metadata. */
export interface ScenePlanningIdentityMatch<T> {
  value: T | null;
  context: ScenePlanningIdentityContext;
}

interface ScenePlanningIdentityItem {
  sceneId: string;
  sceneIndex: number;
}

function logDuplicatePlanningSceneIdsDev(sceneId: string, matchCount: number): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn(
    `[creator-asset-planning] duplicate planning sceneId "${sceneId}" — using first of ${matchCount} matches`,
  );
}

function findFirstBySceneId<T extends ScenePlanningIdentityItem>(
  items: readonly T[],
  sceneId: string,
): T | undefined {
  if (!sceneId.trim()) {
    return undefined;
  }

  let firstMatch: T | undefined;

  for (const item of items) {
    if (item.sceneId !== sceneId) {
      continue;
    }

    if (!firstMatch) {
      firstMatch = item;
      continue;
    }

    logDuplicatePlanningSceneIdsDev(sceneId, 2);
    return firstMatch;
  }

  return firstMatch;
}

function findBySceneIndex<T extends ScenePlanningIdentityItem>(
  items: readonly T[],
  sceneIndex: number,
): T | undefined {
  return items.find((item) => item.sceneIndex === sceneIndex);
}

function buildIdentityContext(input: {
  sceneId: string;
  sceneIndex: number;
  sourcePlanningVersion: string;
  lookupMethod: ScenePlanningLookupMethod;
  usedIndexFallback: boolean;
}): ScenePlanningIdentityContext {
  return {
    sceneId: input.sceneId,
    sceneIndex: input.sceneIndex,
    sourcePlanningVersion: input.sourcePlanningVersion,
    lookupMethod: input.lookupMethod,
    usedIndexFallback: input.usedIndexFallback,
  };
}

/** Resolves a planning row by scene id, then scene index. */
export function resolvePlanningItemBySceneIdentity<T extends ScenePlanningIdentityItem>(
  items: readonly T[],
  sceneId: string,
  sceneIndex: number,
  sourcePlanningVersion: string = CREATOR_ASSET_PLANNING_VERSION,
): ScenePlanningIdentityMatch<T> {
  const byId = findFirstBySceneId(items, sceneId);
  if (byId) {
    return {
      value: byId,
      context: buildIdentityContext({
        sceneId,
        sceneIndex,
        sourcePlanningVersion,
        lookupMethod: "scene_id",
        usedIndexFallback: false,
      }),
    };
  }

  const byIndex = findBySceneIndex(items, sceneIndex);
  if (byIndex) {
    return {
      value: byIndex,
      context: buildIdentityContext({
        sceneId,
        sceneIndex,
        sourcePlanningVersion,
        lookupMethod: "scene_index",
        usedIndexFallback: true,
      }),
    };
  }

  return {
    value: null,
    context: buildIdentityContext({
      sceneId,
      sceneIndex,
      sourcePlanningVersion,
      lookupMethod: "none",
      usedIndexFallback: false,
    }),
  };
}

/** Resolves scene recommendation by stable scene id with index fallback. */
export function resolveSceneRecommendationByIdentity(
  planning: CreatorAssetStudioPlanningData,
  sceneId: string,
  sceneIndex: number,
): ScenePlanningIdentityMatch<SceneRecommendation> {
  return resolvePlanningItemBySceneIdentity(
    planning.recommendation.sceneRecommendations,
    sceneId,
    sceneIndex,
    planning.recommendation.recommendationVersion,
  );
}

/** Resolves provider planning by stable scene id with index fallback. */
export function resolveSceneProviderByIdentity(
  planning: CreatorAssetStudioPlanningData,
  sceneId: string,
  sceneIndex: number,
): ScenePlanningIdentityMatch<AssetProviderResult> {
  return resolvePlanningItemBySceneIdentity(
    planning.providerPlan.sceneResults,
    sceneId,
    sceneIndex,
    planning.providerPlan.version,
  );
}

/** Returns whether any scene in the script resolves via index fallback. */
export function detectSceneIdentityIndexFallbacks(
  script: FootieScript,
  planning: CreatorAssetStudioPlanningData,
): ScenePlanningIdentityContext[] {
  return script.scenes
    .map((scene, sceneIndex) =>
      resolveSceneRecommendationByIdentity(planning, scene.id, sceneIndex).context,
    )
    .filter((context) => context.usedIndexFallback);
}

/** Builds staleness when index fallback is required for identity resolution. */
export function buildIdentityMismatchStaleness(
  existing: PlanningStaleness | undefined,
  hasIndexFallback: boolean,
): PlanningStaleness {
  return mergeIdentityMismatchStaleness(existing, hasIndexFallback);
}

export { SCENE_IDENTITY_MISMATCH_REASON };
