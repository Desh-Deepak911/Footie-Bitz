import type { AssetProviderId } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { AssetProviderResult } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { AssetRecommendation } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";
import type { SceneRecommendation } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";

import type {
  AssetBrowserInitialSearchContext,
  AssetBrowserSearchContext,
} from "./asset-browser.types";

/** Builds read-only browser handoff context from cached Creator Asset Studio planning. */
export function buildAssetBrowserInitialSearchContext(input: {
  sceneId: string;
  sceneIndex: number;
  query: string;
  topRecommendation?: AssetRecommendation;
  providerResult?: AssetProviderResult;
}): AssetBrowserInitialSearchContext | null {
  const query = input.query.trim();
  if (!query) {
    return null;
  }

  const rankedProviderIds = input.providerResult?.rankedProviders.map(
    (provider) => provider.providerId,
  );

  return {
    query,
    sceneId: input.sceneId,
    sceneIndex: input.sceneIndex,
    visualIntent: input.topRecommendation?.visualIntent,
    semanticSlot: input.topRecommendation?.semanticRole,
    rankedProviderIds:
      rankedProviderIds && rankedProviderIds.length > 0 ? rankedProviderIds : undefined,
  };
}

/** Builds orchestrator search context for the asset browser API. */
export function buildAssetBrowserSearchContext(input: {
  storyId: string;
  sceneId: string;
  sceneIndex: number;
  sceneRecommendation: SceneRecommendation;
  providerResult: AssetProviderResult;
}): AssetBrowserSearchContext {
  return {
    storyId: input.storyId,
    sceneId: input.sceneId,
    sceneIndex: input.sceneIndex,
    recommendation: input.sceneRecommendation,
    providerResult: input.providerResult,
  };
}

/** Returns whether a studio recommendation can hand off to the asset browser. */
export function canHandoffToAssetBrowser(input: {
  searchEnabled: boolean;
  hasRecommendation: boolean;
  initialSearchContext: AssetBrowserInitialSearchContext | null;
  searchContext: AssetBrowserSearchContext | null;
}): boolean {
  return (
    input.searchEnabled &&
    input.hasRecommendation &&
    Boolean(input.initialSearchContext) &&
    Boolean(input.searchContext)
  );
}

/** Resolves preferred provider order labels for handoff UI — provider ids only. */
export function resolveHandoffProviderOrder(
  rankedProviderIds?: AssetProviderId[],
): AssetProviderId[] {
  return rankedProviderIds ? [...rankedProviderIds] : [];
}
