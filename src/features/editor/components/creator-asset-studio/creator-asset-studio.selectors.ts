import type { AssetProviderResult } from "@/features/asset-intelligence/providers/asset-provider.types";
import type {
  RecommendedAssetCandidate,
  SceneRecommendation,
} from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";
import type {
  AssetRepairSuggestion,
  AssetValidationResult,
} from "@/features/asset-intelligence/validator/asset-validator.types";
import {
  resolveSceneProviderByIdentity,
  resolveSceneRecommendationByIdentity,
} from "@/features/editor/creator-asset-planning/creator-asset-scene-identity.utils";

import type { CreatorAssetStudioPlanningData } from "./creator-asset-studio.types";

/** Returns the scene recommendation for a selected scene — scene id first, index fallback. */
export function selectSceneRecommendation(
  planning: CreatorAssetStudioPlanningData | null | undefined,
  sceneIndex: number,
  sceneId: string,
): SceneRecommendation | undefined {
  if (!planning) {
    return undefined;
  }

  return resolveSceneRecommendationByIdentity(planning, sceneId, sceneIndex).value ?? undefined;
}

/** Returns ranked provider planning output for a selected scene — scene id first, index fallback. */
export function selectSceneProviders(
  planning: CreatorAssetStudioPlanningData | null | undefined,
  sceneIndex: number,
  sceneId: string,
): AssetProviderResult | undefined {
  if (!planning) {
    return undefined;
  }

  return resolveSceneProviderByIdentity(planning, sceneId, sceneIndex).value ?? undefined;
}

/** Returns project-level validation output for the planning run. */
export function selectSceneValidation(
  planning: CreatorAssetStudioPlanningData | null | undefined,
): AssetValidationResult | undefined {
  return planning?.validationResult;
}

/** Returns ranked alternative recommendations for a selected scene — scene id first, index fallback. */
export function selectSceneAlternatives(
  planning: CreatorAssetStudioPlanningData | null | undefined,
  sceneIndex: number,
  sceneId: string,
): RecommendedAssetCandidate[] {
  return selectSceneRecommendation(planning, sceneIndex, sceneId)?.alternatives ?? [];
}

/** Returns repair suggestions scoped to a selected scene when possible. */
export function selectSceneRepairSuggestions(
  planning: CreatorAssetStudioPlanningData | null | undefined,
  sceneIndex: number,
  sceneId: string,
): AssetRepairSuggestion[] {
  if (!planning) {
    return [];
  }

  const resolvedSceneId = selectSceneRecommendation(planning, sceneIndex, sceneId)?.sceneId ?? sceneId;
  const suggestions = planning.validationResult.repairSuggestions;

  if (!resolvedSceneId) {
    return [...suggestions];
  }

  const scoped = suggestions.filter(
    (suggestion) => !suggestion.targetSceneId || suggestion.targetSceneId === resolvedSceneId,
  );

  return scoped.length > 0 ? scoped : [...suggestions];
}

/** Returns whether the selected scene has a primary recommendation to render. */
export function selectSceneHasRecommendation(
  planning: CreatorAssetStudioPlanningData | null | undefined,
  sceneIndex: number,
  sceneId: string,
): boolean {
  return Boolean(selectSceneRecommendation(planning, sceneIndex, sceneId)?.topRecommendation);
}

/** Returns the recommended search query for a selected scene — scene id first, index fallback. */
export function selectSceneSearchQuery(
  planning: CreatorAssetStudioPlanningData | null | undefined,
  sceneIndex: number,
  sceneId: string,
): string {
  const sceneRecommendation = selectSceneRecommendation(planning, sceneIndex, sceneId);
  const providerResult = selectSceneProviders(planning, sceneIndex, sceneId);

  return sceneRecommendation?.topRecommendation?.query ?? providerResult?.query ?? "";
}

/** Exposes identity resolution for verification without mutating cache. */
export {
  detectSceneIdentityIndexFallbacks,
  resolveSceneRecommendationByIdentity,
} from "@/features/editor/creator-asset-planning/creator-asset-scene-identity.utils";
