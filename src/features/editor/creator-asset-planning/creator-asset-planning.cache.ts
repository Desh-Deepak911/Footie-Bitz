import type { PlanningStaleness } from "@/features/editor/story-evolution/story-evolution.types";

import {
  attachPlanningStaleness,
  mergeSoftReadStaleness,
  type PlanningReadMode,
  type ReadPlanningDataMetadata,
  type ReadPlanningDataOptions,
} from "./creator-asset-planning-soft-read.utils";
import type {
  CreatorAssetPlanningCache,
  CreatorAssetPlanningCacheEntry,
  CreatorAssetStudioPlanningData,
} from "./creator-asset-planning.types";

const planningCaches = new Map<string, CreatorAssetPlanningCache>();

function clonePlanningData(
  planning: CreatorAssetStudioPlanningData,
): CreatorAssetStudioPlanningData {
  const cloned = structuredClone(planning);
  if (cloned.staleness) {
    cloned.staleness = structuredClone(cloned.staleness);
  }
  return cloned;
}

function cloneCacheEntry(entry: CreatorAssetPlanningCacheEntry): CreatorAssetPlanningCacheEntry {
  return {
    ...entry,
    planning: clonePlanningData(entry.planning),
    staleness: entry.staleness ? structuredClone(entry.staleness) : undefined,
  };
}

function metadataMatches(
  entry: CreatorAssetPlanningCacheEntry,
  metadata: ReadPlanningDataMetadata,
): boolean {
  return (
    entry.scriptHash === metadata.scriptHash &&
    entry.sceneCount === metadata.sceneCount &&
    entry.storyMode === metadata.storyMode
  );
}

/** Creates or returns the planning cache handle for a story. */
export function createPlanningCache(storyId: string): CreatorAssetPlanningCache {
  const existing = planningCaches.get(storyId);
  if (existing) {
    return existing;
  }

  const created: CreatorAssetPlanningCache = {
    storyId,
    entry: null,
  };
  planningCaches.set(storyId, created);
  return created;
}

/** Stores or replaces cached planning for a story. */
export function updatePlanningCache(
  storyId: string,
  entry: CreatorAssetPlanningCacheEntry,
): CreatorAssetPlanningCache {
  const cache = createPlanningCache(storyId);
  cache.entry = cloneCacheEntry({ ...entry, storyId });
  planningCaches.set(storyId, cache);
  return cache;
}

/** Clears cached planning for a story. */
export function invalidatePlanningCache(storyId: string): void {
  const cache = planningCaches.get(storyId);
  if (!cache) {
    return;
  }

  cache.entry = null;
  planningCaches.set(storyId, cache);
}

/** Updates staleness metadata on an existing cache entry without replacing planning. */
export function updatePlanningCacheStaleness(
  storyId: string,
  staleness: PlanningStaleness,
): CreatorAssetPlanningCacheEntry | null {
  const cache = planningCaches.get(storyId);
  if (!cache?.entry) {
    return null;
  }

  cache.entry = cloneCacheEntry({
    ...cache.entry,
    staleness,
  });
  planningCaches.set(storyId, cache);
  return cloneCacheEntry(cache.entry);
}

/** Returns a cloned cache entry without mutating the stored snapshot. */
export function readPlanningCache(storyId: string): CreatorAssetPlanningCacheEntry | null {
  const entry = planningCaches.get(storyId)?.entry;
  return entry ? cloneCacheEntry(entry) : null;
}

/** Returns cloned planning data — soft mode keeps stale planning visible. */
export function readPlanningData(
  storyId: string,
  metadata: ReadPlanningDataMetadata,
  options: ReadPlanningDataOptions = {},
): CreatorAssetStudioPlanningData | null {
  const mode: PlanningReadMode = options.mode ?? "soft";
  const entry = planningCaches.get(storyId)?.entry;
  if (!entry) {
    return null;
  }

  const planning = clonePlanningData(entry.planning);
  delete planning.staleness;

  if (metadataMatches(entry, metadata)) {
    if (entry.staleness?.isStale) {
      return attachPlanningStaleness(planning, structuredClone(entry.staleness));
    }
    return planning;
  }

  if (mode === "strict") {
    return null;
  }

  const staleness = mergeSoftReadStaleness(entry, metadata);
  return attachPlanningStaleness(planning, staleness);
}

/** Clears all in-memory planning caches — test helper only. */
export function resetPlanningCachesForTests(): void {
  planningCaches.clear();
}

/** Returns whether a cache entry exists for a story id. */
export function hasPlanningCache(storyId: string): boolean {
  return Boolean(planningCaches.get(storyId)?.entry);
}

export type { PlanningReadMode, ReadPlanningDataMetadata, ReadPlanningDataOptions } from "./creator-asset-planning-soft-read.utils";
