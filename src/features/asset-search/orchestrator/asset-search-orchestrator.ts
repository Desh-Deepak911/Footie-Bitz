import {
  getProvider,
  resolveProviderOrder,
} from "../providers/provider.registry";
import type {
  AssetSearchProviderAsset,
  AssetSearchProviderResult,
} from "../providers/provider.types";

import {
  hasAssetSearchCacheEntry,
  readAssetSearchCache,
  writeAssetSearchCache,
} from "./asset-search-cache";
import type {
  AssetAttribution,
  AssetLicenseInfo,
  AssetSearchDiagnostics,
  AssetSearchOrchestratorInput,
  AssetSearchOrchestratorResult,
  AssetSearchProviderId,
  AssetSearchRequest,
  NormalizedAssetResult,
} from "./asset-search.types";
import { ASSET_SEARCH_PLATFORM_VERSION } from "./asset-search.types";
import {
  buildAssetSearchRequest,
  buildAssetSearchRequests,
  hashAssetSearchRequest,
  isAssetSearchEnabled,
  resolveRankedProviderIds,
  resolveRankedProviderPriorities,
  resolveSearchQueryFromOrchestratorInput,
} from "./asset-search.utils";

function buildDisabledDiagnostics(input: {
  requestHash: string;
  providerOrder: AssetSearchProviderId[];
  searchDurationMs: number;
}): AssetSearchDiagnostics {
  return {
    platformVersion: ASSET_SEARCH_PLATFORM_VERSION,
    requestHash: input.requestHash,
    cacheHit: false,
    providerAttempts: [],
    providerFailures: [],
    normalizedResultCount: 0,
    searchDurationMs: input.searchDurationMs,
    providerOrder: input.providerOrder,
    disabledReason: "ASSET_SEARCH_ENABLED is not true",
    warnings: [],
  };
}

function buildEmptyDiagnostics(input: {
  requestHash: string;
  providerOrder: AssetSearchProviderId[];
  searchDurationMs: number;
  providerAttempts: AssetSearchProviderId[];
  providerFailures: Array<{ providerId: AssetSearchProviderId; error: string }>;
  cacheHit?: boolean;
  warnings?: string[];
}): AssetSearchDiagnostics {
  return {
    platformVersion: ASSET_SEARCH_PLATFORM_VERSION,
    requestHash: input.requestHash,
    cacheHit: input.cacheHit ?? false,
    providerAttempts: input.providerAttempts,
    providerFailures: input.providerFailures,
    normalizedResultCount: 0,
    searchDurationMs: input.searchDurationMs,
    providerOrder: input.providerOrder,
    warnings: input.warnings ?? [],
  };
}

function buildLicenseInfo(providerId: AssetSearchProviderId): AssetLicenseInfo {
  return {
    licenseType: providerId === "mock" ? "platform" : "unknown",
    requiresAttribution: providerId !== "mock",
    commercialUse: true,
    modificationAllowed: true,
    editorialOnly: false,
    licenseUrl:
      providerId === "mock"
        ? "https://mock.asset-search.local/license/platform"
        : undefined,
  };
}

function buildAttribution(
  providerId: AssetSearchProviderId,
  asset: AssetSearchProviderAsset,
): AssetAttribution {
  const providerName =
    providerId === "mock" ? "Mock Asset Search" : providerId.replace(/_/g, " ");

  return {
    creatorName: "Mock Creator",
    creatorUrl: "https://mock.asset-search.local/creator",
    providerName,
    providerUrl: `https://mock.asset-search.local/providers/${providerId}`,
    requiredText: `Photo by Mock Creator on ${providerName} — ${asset.title}`,
  };
}

/** Normalizes provider-local assets into platform results. */
export function normalizeProviderResults(
  result: AssetSearchProviderResult,
  request: AssetSearchRequest,
): NormalizedAssetResult[] {
  return result.assets.map((asset, index) => ({
    id: `${result.providerId}:${asset.providerAssetId}`,
    providerId: result.providerId,
    title: asset.title,
    description: asset.description,
    previewUrl: asset.previewUrl,
    thumbnailUrl: asset.thumbnailUrl,
    fullResolutionUrl: asset.fullResolutionUrl,
    width: asset.width,
    height: asset.height,
    orientation: asset.orientation,
    tags: asset.tags ?? [],
    license: asset.license ?? buildLicenseInfo(result.providerId),
    attribution: asset.attribution ?? buildAttribution(result.providerId, asset),
    score: asset.score ?? Math.max(0.2, 1 - index * 0.05),
    metadata: {
      requestId: request.requestId,
      query: request.query,
      ...(asset.metadata ?? {}),
    },
  }));
}

async function executeProviderSearch(
  request: AssetSearchRequest,
): Promise<{
  results: NormalizedAssetResult[];
  diagnostics: AssetSearchDiagnostics;
  success: boolean;
  error?: string;
}> {
  const startedAt = Date.now();
  const providerOrder = [request.providerId];
  const requestHash = hashAssetSearchRequest(request);

  const cached = readAssetSearchCache(request);
  if (cached) {
    return {
      success: cached.results.length > 0,
      results: cached.results,
      diagnostics: {
        ...cached.diagnostics,
        cacheHit: true,
        searchDurationMs: Date.now() - startedAt,
      },
    };
  }

  const provider = getProvider(request.providerId);
  if (!provider) {
    return {
      success: false,
      results: [],
      error: `provider "${request.providerId}" is not registered`,
      diagnostics: buildEmptyDiagnostics({
        requestHash,
        providerOrder,
        searchDurationMs: Date.now() - startedAt,
        providerAttempts: [request.providerId],
        providerFailures: [
          {
            providerId: request.providerId,
            error: `provider "${request.providerId}" is not registered`,
          },
        ],
        warnings: ["provider_not_registered"],
      }),
    };
  }

  const providerAttempts: AssetSearchProviderId[] = [request.providerId];
  const providerFailures: Array<{ providerId: AssetSearchProviderId; error: string }> = [];

  try {
    const providerResult = await provider.search(request);
    if (!providerResult.success) {
      providerFailures.push({
        providerId: request.providerId,
        error: providerResult.error ?? "provider search failed",
      });

      return {
        success: false,
        results: [],
        error: providerResult.error ?? "provider search failed",
        diagnostics: buildEmptyDiagnostics({
          requestHash,
          providerOrder,
          searchDurationMs: Date.now() - startedAt,
          providerAttempts,
          providerFailures,
        }),
      };
    }

    const normalized = normalizeProviderResults(providerResult, request);
    const diagnostics: AssetSearchDiagnostics = {
      platformVersion: ASSET_SEARCH_PLATFORM_VERSION,
      requestHash,
      cacheHit: false,
      providerAttempts,
      providerFailures,
      normalizedResultCount: normalized.length,
      searchDurationMs: Date.now() - startedAt,
      providerOrder,
      warnings: [],
    };

    writeAssetSearchCache({
      request,
      results: normalized,
      diagnostics,
    });

    return {
      success: normalized.length > 0,
      results: normalized,
      diagnostics,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "provider search failed";
    providerFailures.push({ providerId: request.providerId, error: message });

    return {
      success: false,
      results: [],
      error: message,
      diagnostics: buildEmptyDiagnostics({
        requestHash,
        providerOrder,
        searchDurationMs: Date.now() - startedAt,
        providerAttempts,
        providerFailures,
      }),
    };
  }
}

/**
 * Runs the asset search orchestrator pipeline.
 * Never throws — failures are recorded in diagnostics.
 */
export async function runAssetSearchOrchestrator(
  input: AssetSearchOrchestratorInput,
): Promise<AssetSearchOrchestratorResult> {
  const startedAt = Date.now();
  const query = resolveSearchQueryFromOrchestratorInput(input);
  const providerOrder = resolveProviderOrder({
    rankedProviderIds: resolveRankedProviderIds(input.providerResult),
    rankedPriorities: resolveRankedProviderPriorities(input.providerResult),
  });
  const baseRequest =
    providerOrder.length > 0
      ? buildAssetSearchRequest({
          orchestrator: input,
          providerId: providerOrder[0]!,
          query,
        })
      : null;
  const requestHash = baseRequest ? hashAssetSearchRequest(baseRequest) : "disabled";

  if (!isAssetSearchEnabled()) {
    return {
      success: false,
      query,
      sceneId: input.sceneId,
      sceneIndex: input.sceneIndex,
      storyId: input.storyId,
      results: [],
      diagnostics: buildDisabledDiagnostics({
        requestHash,
        providerOrder,
        searchDurationMs: Date.now() - startedAt,
      }),
      error: "Asset search is disabled",
    };
  }

  if (!query.trim()) {
    return {
      success: false,
      query: "",
      sceneId: input.sceneId,
      sceneIndex: input.sceneIndex,
      storyId: input.storyId,
      results: [],
      diagnostics: buildEmptyDiagnostics({
        requestHash,
        providerOrder,
        searchDurationMs: Date.now() - startedAt,
        providerAttempts: [],
        providerFailures: [],
        warnings: ["missing_search_query"],
      }),
      error: "search query is required",
    };
  }

  const requests = buildAssetSearchRequests({
    orchestrator: input,
    providerOrder,
  });

  const providerAttempts: AssetSearchProviderId[] = [];
  const providerFailures: Array<{ providerId: AssetSearchProviderId; error: string }> = [];
  const warnings: string[] = [];

  for (const request of requests) {
    if (hasAssetSearchCacheEntry(request)) {
      const cached = readAssetSearchCache(request);
      if (cached && cached.results.length > 0) {
        return {
          success: true,
          query,
          sceneId: input.sceneId,
          sceneIndex: input.sceneIndex,
          storyId: input.storyId,
          results: cached.results,
          diagnostics: {
            ...cached.diagnostics,
            cacheHit: true,
            providerOrder,
            searchDurationMs: Date.now() - startedAt,
            providerAttempts: [...providerAttempts, request.providerId],
            providerFailures,
            normalizedResultCount: cached.results.length,
            warnings,
          },
        };
      }
    }

    providerAttempts.push(request.providerId);
    const provider = getProvider(request.providerId);
    if (!provider) {
      providerFailures.push({
        providerId: request.providerId,
        error: `provider "${request.providerId}" is not registered`,
      });
      continue;
    }

    const attempt = await executeProviderSearch(request);
    if (attempt.success && attempt.results.length > 0) {
      return {
        success: true,
        query,
        sceneId: input.sceneId,
        sceneIndex: input.sceneIndex,
        storyId: input.storyId,
        results: attempt.results,
        diagnostics: {
          ...attempt.diagnostics,
          providerOrder,
          providerAttempts,
          providerFailures: [...providerFailures, ...attempt.diagnostics.providerFailures],
          searchDurationMs: Date.now() - startedAt,
          warnings,
        },
      };
    }

    if (attempt.error) {
      providerFailures.push({
        providerId: request.providerId,
        error: attempt.error,
      });
    }
  }

  return {
    success: false,
    query,
    sceneId: input.sceneId,
    sceneIndex: input.sceneIndex,
    storyId: input.storyId,
    results: [],
    diagnostics: buildEmptyDiagnostics({
      requestHash,
      providerOrder,
      searchDurationMs: Date.now() - startedAt,
      providerAttempts,
      providerFailures,
      warnings: providerFailures.length > 0 ? warnings : ["all_providers_failed", ...warnings],
    }),
    error: providerFailures.at(-1)?.error ?? "asset search failed",
  };
}
