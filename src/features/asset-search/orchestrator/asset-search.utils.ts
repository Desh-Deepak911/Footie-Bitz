import type { AssetProviderId } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { AssetProviderResult } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { SceneRecommendation } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";

import type {
  AssetLicensePreference,
  AssetSearchOrchestratorInput,
  AssetSearchOrientation,
  AssetSearchProviderId,
  AssetSearchRequest,
} from "./asset-search.types";

const DEFAULT_LIMIT = 12;
const DEFAULT_PAGE = 1;

/** Returns whether the asset search platform is enabled. */
export function isAssetSearchEnabled(): boolean {
  return process.env.ASSET_SEARCH_ENABLED === "true";
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `asset-search-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resolveSearchQuery(
  recommendation: SceneRecommendation,
  providerResult: AssetProviderResult,
): string {
  return (
    recommendation.topRecommendation?.query?.trim() ||
    providerResult.query?.trim() ||
    ""
  );
}

function resolveOrientation(input: AssetSearchOrchestratorInput): AssetSearchOrientation {
  return input.orientation ?? "any";
}

/** Maps cached planning recommendations into a future-compatible search request. */
export function buildAssetSearchRequest(input: {
  orchestrator: AssetSearchOrchestratorInput;
  providerId: AssetSearchProviderId;
  query: string;
}): AssetSearchRequest {
  const { orchestrator, providerId, query } = input;
  const recommendation = orchestrator.recommendation;
  const top = recommendation.topRecommendation;

  const request: AssetSearchRequest = {
    requestId: createRequestId(),
    query,
    providerId,
    sceneId: orchestrator.sceneId,
    storyId: orchestrator.storyId,
    sceneIndex: orchestrator.sceneIndex,
    semanticSlot: orchestrator.semanticSlot ?? top?.semanticRole,
    visualIntent: top?.visualIntent,
    contentPattern: orchestrator.contentPattern,
    entityIds: top?.entityIds ?? [],
    orientation: resolveOrientation(orchestrator),
    page: orchestrator.page ?? DEFAULT_PAGE,
    limit: orchestrator.limit ?? DEFAULT_LIMIT,
    safeSearch: orchestrator.safeSearch ?? true,
    licensePreference: orchestrator.licensePreference ?? "any",
    metadata: {
      planningConfidence: top?.confidence ?? recommendation.confidence,
      recommendationScore: top?.score ?? null,
      ...(orchestrator.metadata ?? {}),
    },
  };

  return request;
}

/** Builds search requests for each provider in resolved execution order. */
export function buildAssetSearchRequests(input: {
  orchestrator: AssetSearchOrchestratorInput;
  providerOrder: AssetSearchProviderId[];
}): AssetSearchRequest[] {
  const query = resolveSearchQueryFromOrchestratorInput(input.orchestrator);
  if (!query) {
    return [];
  }

  return input.providerOrder.map((providerId) =>
    buildAssetSearchRequest({
      orchestrator: input.orchestrator,
      providerId,
      query,
    }),
  );
}

/** Stable hash for cache keys — future-compatible with Redis/Supabase. */
export function hashAssetSearchRequest(request: AssetSearchRequest): string {
  const payload = {
    query: request.query.trim().toLowerCase(),
    providerId: request.providerId,
    orientation: request.orientation,
    page: request.page,
    limit: request.limit,
    safeSearch: request.safeSearch,
    licensePreference: request.licensePreference,
    semanticSlot: request.semanticSlot ?? "",
    visualIntent: request.visualIntent ?? "",
  };

  return hashStableJson(payload);
}

export function hashStableJson(value: unknown): string {
  const serialized = JSON.stringify(value);
  let hash = 2166136261;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `as-${(hash >>> 0).toString(16)}`;
}

export function resolveRankedProviderIds(
  providerResult: AssetProviderResult,
): AssetProviderId[] {
  return providerResult.rankedProviders.map((provider) => provider.providerId);
}

export function resolveRankedProviderPriorities(
  providerResult: AssetProviderResult,
): import("@/features/asset-intelligence/providers/asset-provider.types").AssetProviderPriority[] {
  return providerResult.rankedProviders.map((provider) => provider.priority);
}

export function resolveSearchQueryFromOrchestratorInput(
  input: AssetSearchOrchestratorInput,
): string {
  return input.query?.trim() || resolveSearchQuery(input.recommendation, input.providerResult);
}

export function defaultLicensePreference(): AssetLicensePreference {
  return "any";
}
