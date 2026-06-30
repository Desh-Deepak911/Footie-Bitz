import { isAssetIntelligencePlanningEnabled } from "@/features/editor/creator-asset-planning/creator-asset-planning-generation.utils";
import { readPlanningCache } from "@/features/editor/creator-asset-planning/creator-asset-planning.cache";
import { cacheCreatorAssetPlanning } from "@/features/editor/creator-asset-planning/creator-asset-planning.utils";
import { resolveScriptMode } from "@/types/footiebitz";

import type {
  CreatorAssetPlanningRefreshInput,
  CreatorAssetPlanningRefreshResult,
} from "./creator-asset-planning-refresh.types";
import {
  assertRefreshInput,
  buildRefreshDiagnostics,
  buildRefreshedPlanningSnapshot,
  CREATOR_ASSET_PLANNING_REFRESH_EFFECTIVE_SCOPE,
} from "./creator-asset-planning-refresh.utils";

/**
 * Rebuilds Creator Asset Studio planning from the current script and replaces
 * the in-memory cache entry on success. Preserves the previous cache on failure.
 */
export async function refreshCreatorAssetPlanning(
  input: CreatorAssetPlanningRefreshInput,
): Promise<CreatorAssetPlanningRefreshResult> {
  const startedAt = Date.now();
  const storyMode = resolveScriptMode(input.storyMode);
  const previousEntry = readPlanningCache(input.storyId);
  const diagnosticsBase = buildRefreshDiagnostics(input, previousEntry, input.script);
  const refreshedAt = new Date().toISOString();

  if (!isAssetIntelligencePlanningEnabled()) {
    return {
      success: false,
      diagnostics: {
        ...diagnosticsBase,
        effectiveScope: CREATOR_ASSET_PLANNING_REFRESH_EFFECTIVE_SCOPE,
        refreshedAt,
        durationMs: Date.now() - startedAt,
        cacheReplaced: false,
      },
      error: "Asset Intelligence planning is disabled",
    };
  }

  try {
    assertRefreshInput(input);

    const snapshot = buildRefreshedPlanningSnapshot(input);
    const entry = cacheCreatorAssetPlanning({
      storyId: input.storyId,
      script: input.script,
      storyMode,
      planning: snapshot.planning,
    });

    return {
      success: true,
      planning: entry.planning,
      diagnostics: {
        ...diagnosticsBase,
        effectiveScope: CREATOR_ASSET_PLANNING_REFRESH_EFFECTIVE_SCOPE,
        refreshedAt: entry.generatedAt,
        durationMs: Date.now() - startedAt,
        newScriptHash: entry.scriptHash,
        cacheReplaced: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      diagnostics: {
        ...diagnosticsBase,
        effectiveScope: CREATOR_ASSET_PLANNING_REFRESH_EFFECTIVE_SCOPE,
        refreshedAt,
        durationMs: Date.now() - startedAt,
        cacheReplaced: false,
      },
      error: error instanceof Error ? error.message : "Planning refresh failed",
    };
  }
}
