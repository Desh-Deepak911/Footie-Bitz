import type {
  AssetMaterializationCacheEntry,
  AssetMaterializationResult,
} from "./asset-materialization.types";
import { DEFAULT_MATERIALIZATION_CACHE_TTL_MS } from "./asset-materialization.utils";

const cache = new Map<string, AssetMaterializationCacheEntry>();

function cloneResult(result: AssetMaterializationResult): AssetMaterializationResult {
  return structuredClone(result);
}

/** Reads a cache entry when present and not expired. */
export function readAssetMaterializationCache(
  cacheKey: string,
): AssetMaterializationResult | null {
  const entry = cache.get(cacheKey);
  if (!entry) {
    return null;
  }

  if (Date.parse(entry.expiresAt) <= Date.now()) {
    cache.delete(cacheKey);
    return null;
  }

  return cloneResult(entry.result);
}

/** Writes a materialization result to the in-memory server cache. */
export function writeAssetMaterializationCache(input: {
  cacheKey: string;
  result: AssetMaterializationResult;
  ttlMs?: number;
}): AssetMaterializationCacheEntry {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + (input.ttlMs ?? DEFAULT_MATERIALIZATION_CACHE_TTL_MS),
  ).toISOString();

  const entry: AssetMaterializationCacheEntry = {
    cacheKey: input.cacheKey,
    createdAt,
    expiresAt,
    result: cloneResult(input.result),
  };

  cache.set(input.cacheKey, entry);
  return {
    ...entry,
    result: cloneResult(entry.result),
  };
}

/** Clears all cache entries — verification helper only. */
export function resetAssetMaterializationCacheForTests(): void {
  cache.clear();
}

/** Returns current cache size — verification helper only. */
export function getAssetMaterializationCacheSizeForTests(): number {
  return cache.size;
}
