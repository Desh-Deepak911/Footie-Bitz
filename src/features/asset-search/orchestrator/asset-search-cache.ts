import type {
  AssetSearchCacheEntry,
  AssetSearchDiagnostics,
  AssetSearchProviderId,
  AssetSearchRequest,
  NormalizedAssetResult,
} from "./asset-search.types";
import { hashAssetSearchRequest } from "./asset-search.utils";

const DEFAULT_TTL_MS = 30 * 60 * 1000;

const cache = new Map<string, AssetSearchCacheEntry>();

function cloneResults(results: NormalizedAssetResult[]): NormalizedAssetResult[] {
  return structuredClone(results);
}

function cloneDiagnostics(diagnostics: AssetSearchDiagnostics): AssetSearchDiagnostics {
  return structuredClone(diagnostics);
}

/** Reads a cache entry when present and not expired. */
export function readAssetSearchCache(
  request: AssetSearchRequest,
): AssetSearchCacheEntry | null {
  const requestHash = hashAssetSearchRequest(request);
  const entry = cache.get(requestHash);
  if (!entry) {
    return null;
  }

  if (Date.parse(entry.expiresAt) <= Date.now()) {
    cache.delete(requestHash);
    return null;
  }

  return {
    ...entry,
    results: cloneResults(entry.results),
    diagnostics: cloneDiagnostics(entry.diagnostics),
  };
}

/** Writes normalized results to the in-memory server cache. */
export function writeAssetSearchCache(input: {
  request: AssetSearchRequest;
  results: NormalizedAssetResult[];
  diagnostics: AssetSearchDiagnostics;
  ttlMs?: number;
}): AssetSearchCacheEntry {
  const requestHash = hashAssetSearchRequest(input.request);
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + (input.ttlMs ?? DEFAULT_TTL_MS)).toISOString();

  const entry: AssetSearchCacheEntry = {
    requestHash,
    providerId: input.request.providerId,
    createdAt,
    expiresAt,
    results: cloneResults(input.results),
    diagnostics: cloneDiagnostics(input.diagnostics),
  };

  cache.set(requestHash, entry);
  return cloneCacheEntry(entry);
}

function cloneCacheEntry(entry: AssetSearchCacheEntry): AssetSearchCacheEntry {
  return {
    ...entry,
    results: cloneResults(entry.results),
    diagnostics: cloneDiagnostics(entry.diagnostics),
  };
}

/** Clears all cache entries — verification helper only. */
export function resetAssetSearchCacheForTests(): void {
  cache.clear();
}

/** Returns current cache size — verification helper only. */
export function getAssetSearchCacheSizeForTests(): number {
  return cache.size;
}

/** Returns whether a provider/id hash is cached — verification helper only. */
export function hasAssetSearchCacheEntry(request: AssetSearchRequest): boolean {
  return readAssetSearchCache(request) != null;
}

export type { AssetSearchProviderId };
