import {
  ASSET_SEARCH_PROVIDER_SDK_VERSION,
  buildProviderHealth,
  freezeProviderMetadata,
  type AssetSearchProvider,
} from "./provider-sdk";
import type {
  AssetSearchProviderAsset,
  AssetSearchProviderResult,
} from "./provider.types";
import type { AssetSearchRequest } from "../orchestrator/asset-search.types";
import { hashAssetSearchRequest } from "../orchestrator/asset-search.utils";

export const MOCK_ASSET_SEARCH_PROVIDER_ID = "mock" as const;

export const MOCK_ASSET_SEARCH_PROVIDER_METADATA = freezeProviderMetadata({
  id: MOCK_ASSET_SEARCH_PROVIDER_ID,
  displayName: "Mock Asset Search",
  description: "Deterministic mock search provider for platform verification.",
  website: "https://mock.asset-search.local",
  logo: "provider:mock",
  requiresApiKey: false,
  enabledByDefault: true,
  planningOnly: true,
  priority: 99,
  version: ASSET_SEARCH_PROVIDER_SDK_VERSION,
  capabilities: {
    supportsPortrait: true,
    supportsLandscape: true,
    supportsSquare: true,
    supportsCommercialUse: true,
    supportsIllustrations: true,
    supportsAI: true,
  },
  rateLimits: {
    requestsPerMinute: 1000,
    requestsPerHour: 10000,
    burstLimit: 100,
    retryAfterSeconds: 0,
  },
  authentication: {
    type: "none",
    notes: "Mock provider requires no credentials.",
  },
});

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildDeterministicSeed(request: AssetSearchRequest): number {
  return hashString(
    [
      request.query.trim().toLowerCase(),
      request.providerId,
      request.orientation,
      String(request.page),
      String(request.limit),
    ].join("|"),
  );
}

function resolveOrientation(
  request: AssetSearchRequest,
  index: number,
): "landscape" | "portrait" | "square" {
  if (request.orientation === "portrait") {
    return "portrait";
  }
  if (request.orientation === "square") {
    return "square";
  }
  if (request.orientation === "landscape") {
    return "landscape";
  }

  const orientations: Array<"landscape" | "portrait" | "square"> = [
    "landscape",
    "portrait",
    "square",
  ];
  return orientations[index % orientations.length]!;
}

function buildMockDimensions(orientation: "landscape" | "portrait" | "square", seed: number) {
  switch (orientation) {
    case "portrait":
      return { width: 1080 + (seed % 120), height: 1920 + (seed % 180) };
    case "square":
      return { width: 1200 + (seed % 80), height: 1200 + (seed % 80) };
    default:
      return { width: 1920 + (seed % 160), height: 1080 + (seed % 120) };
  }
}

/** Generates deterministic mock assets from the request query — not static fixtures. */
export function generateDeterministicMockAssets(
  request: AssetSearchRequest,
): AssetSearchProviderAsset[] {
  const trimmedQuery = request.query.trim() || "Untitled query";
  const seed = buildDeterministicSeed(request);
  const count = Math.max(1, Math.min(request.limit, 24));

  return Array.from({ length: count }, (_, index) => {
    const itemSeed = seed + index * 9973;
    const suffix = String(index + 1).padStart(2, "0");
    const orientation = resolveOrientation(request, index);
    const { width, height } = buildMockDimensions(orientation, itemSeed);
    const slug = trimmedQuery.replace(/\s+/g, "-").toLowerCase().slice(0, 48);
    const assetId = `${slug}-${suffix}-${itemSeed.toString(16)}`;

    return {
      providerAssetId: assetId,
      title: `${trimmedQuery} ${suffix}`,
      description: `Deterministic mock result for "${trimmedQuery}".`,
      previewUrl: `https://mock.asset-search.local/preview/${assetId}`,
      thumbnailUrl: `https://mock.asset-search.local/thumb/${assetId}`,
      fullResolutionUrl: `https://mock.asset-search.local/full/${assetId}`,
      width,
      height,
      orientation,
      tags: [trimmedQuery, request.providerId, orientation],
      score: Math.max(0.35, 1 - index * 0.04),
      metadata: {
        mock: true,
        requestHash: hashAssetSearchRequest(request),
        itemIndex: index,
      },
    };
  });
}

/** Mock search provider — deterministic, no HTTP. */
export const MockAssetSearchProvider: AssetSearchProvider = {
  id: MOCK_ASSET_SEARCH_PROVIDER_ID,
  metadata: MOCK_ASSET_SEARCH_PROVIDER_METADATA,

  getHealth() {
    return buildProviderHealth("planning_only", "Mock provider — deterministic platform verification only.");
  },

  async search(request: AssetSearchRequest): Promise<AssetSearchProviderResult> {
    const startedAt = Date.now();
    const query = request.query.trim();

    if (!query) {
      return {
        providerId: MOCK_ASSET_SEARCH_PROVIDER_ID,
        success: false,
        query: "",
        assets: [],
        error: "search query is required",
        durationMs: Date.now() - startedAt,
      };
    }

    return {
      providerId: MOCK_ASSET_SEARCH_PROVIDER_ID,
      success: true,
      query,
      assets: generateDeterministicMockAssets(request),
      durationMs: Date.now() - startedAt,
    };
  },
};
