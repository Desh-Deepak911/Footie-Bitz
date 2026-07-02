import type {
  AssetSearchProvider,
  AssetSearchProviderMetadata,
  ProviderCapabilityRequirement,
  ProviderCapabilityMatch,
} from "./provider-sdk";
import {
  freezeProviderMetadata,
  resolveProvidersByCapability as rankProvidersByCapabilityMetadata,
} from "./provider-sdk";
import type { AssetProviderId } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { AssetProviderPriority } from "@/features/asset-intelligence/providers/asset-provider.types";

import type { AssetSearchProviderId } from "../orchestrator/asset-search.types";

import {
  MOCK_ASSET_SEARCH_PROVIDER_ID,
  MOCK_ASSET_SEARCH_PROVIDER_METADATA,
  MockAssetSearchProvider,
} from "./mock.provider";
import {
  isPexelsProviderAvailable,
  PexelsAssetSearchProvider,
  PEXELS_ASSET_SEARCH_PROVIDER_METADATA,
} from "./pexels";

/** Metadata catalog for all known providers — includes future connectors. */
const PROVIDER_METADATA_CATALOG: readonly AssetSearchProviderMetadata[] = Object.freeze([
  MOCK_ASSET_SEARCH_PROVIDER_METADATA,
  PEXELS_ASSET_SEARCH_PROVIDER_METADATA,
  freezeProviderMetadata({
    id: "unsplash",
    displayName: "Unsplash",
    description: "High-quality photography — connector planned for 3.8B+.",
    website: "https://unsplash.com",
    logo: "provider:unsplash",
    requiresApiKey: true,
    enabledByDefault: false,
    planningOnly: true,
    priority: 12,
    version: "0.0.0",
    capabilities: {
      supportsPortrait: true,
      supportsLandscape: true,
      supportsCommercialUse: true,
      supportsEditorial: true,
    },
    rateLimits: {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      retryAfterSeconds: 60,
    },
    authentication: {
      type: "api_key",
      headerName: "Authorization",
      envKey: "UNSPLASH_ACCESS_KEY",
    },
  }),
  freezeProviderMetadata({
    id: "pixabay",
    displayName: "Pixabay",
    description: "Royalty-free images and videos — connector planned for 3.8B+.",
    website: "https://pixabay.com",
    logo: "provider:pixabay",
    requiresApiKey: true,
    enabledByDefault: false,
    planningOnly: true,
    priority: 14,
    version: "0.0.0",
    capabilities: {
      supportsLandscape: true,
      supportsIllustrations: true,
      supportsCommercialUse: true,
      supportsVideo: true,
    },
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 5000,
      retryAfterSeconds: 30,
    },
    authentication: {
      type: "api_key",
      envKey: "PIXABAY_API_KEY",
    },
  }),
  freezeProviderMetadata({
    id: "wikimedia",
    displayName: "Wikimedia Commons",
    description: "Historical and editorial archive — connector planned for 3.8B+.",
    website: "https://commons.wikimedia.org",
    logo: "provider:wikimedia",
    requiresApiKey: false,
    enabledByDefault: false,
    planningOnly: true,
    priority: 20,
    version: "0.0.0",
    capabilities: {
      supportsHistorical: true,
      supportsArchive: true,
      supportsEditorial: true,
      supportsLandscape: true,
    },
    rateLimits: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      retryAfterSeconds: 120,
    },
    authentication: {
      type: "none",
    },
  }),
  freezeProviderMetadata({
    id: "internal_library",
    displayName: "Internal Library",
    description: "ShortForge curated asset library — connector planned for 3.8B+.",
    website: "https://shortforge.studio",
    logo: "provider:internal-library",
    requiresApiKey: false,
    enabledByDefault: true,
    planningOnly: true,
    priority: 5,
    version: "0.0.0",
    capabilities: {
      supportsPortrait: true,
      supportsLandscape: true,
      supportsCommercialUse: true,
      supportsSports: true,
    },
    rateLimits: {
      requestsPerMinute: 1000,
      requestsPerHour: 10000,
    },
    authentication: {
      type: "bearer_token",
      envKey: "INTERNAL_LIBRARY_TOKEN",
    },
  }),
  freezeProviderMetadata({
    id: "ai_generated",
    displayName: "AI Generated",
    description: "Generated imagery — connector planned for 3.8B+.",
    website: "https://shortforge.studio",
    logo: "provider:ai-generated",
    requiresApiKey: true,
    enabledByDefault: false,
    planningOnly: true,
    priority: 18,
    version: "0.0.0",
    capabilities: {
      supportsAI: true,
      supportsPortrait: true,
      supportsLandscape: true,
      supportsIllustrations: true,
      supportsTransparentBackground: true,
    },
    rateLimits: {
      requestsPerMinute: 20,
      requestsPerHour: 200,
      retryAfterSeconds: 90,
    },
    authentication: {
      type: "api_key",
      envKey: "AI_IMAGE_API_KEY",
    },
  }),
  freezeProviderMetadata({
    id: "manual",
    displayName: "Manual Upload",
    description: "Creator-provided assets — connector planned for 3.8B+.",
    website: "https://shortforge.studio",
    logo: "provider:manual",
    requiresApiKey: false,
    enabledByDefault: true,
    planningOnly: true,
    priority: 30,
    version: "0.0.0",
    capabilities: {
      supportsPortrait: true,
      supportsLandscape: true,
      supportsCommercialUse: true,
    },
    rateLimits: {},
    authentication: {
      type: "none",
    },
  }),
]);

/** Builds executable providers — Pexels registers only when an API key is present. */
function buildRegisteredProviders(): AssetSearchProvider[] {
  const providers: AssetSearchProvider[] = [];

  if (isPexelsProviderAvailable()) {
    providers.push(PexelsAssetSearchProvider);
  }

  providers.push(MockAssetSearchProvider);
  return providers;
}

function buildProviderMap(): Map<AssetSearchProviderId, AssetSearchProvider> {
  return new Map(buildRegisteredProviders().map((provider) => [provider.id, provider]));
}

const METADATA_MAP = new Map<AssetSearchProviderId, AssetSearchProviderMetadata>(
  PROVIDER_METADATA_CATALOG.map((metadata) => [metadata.id, metadata]),
);

const DEFAULT_EXECUTION_ORDER: readonly AssetSearchProviderId[] = Object.freeze([
  "pexels",
  "unsplash",
  "pixabay",
  "wikimedia",
  "internal_library",
  "ai_generated",
  "manual",
  MOCK_ASSET_SEARCH_PROVIDER_ID,
]);

const PRIORITY_RANK: Record<AssetProviderPriority, number> = {
  primary: 0,
  secondary: 1,
  fallback: 2,
  planning_only: 3,
};

/** Returns a registered search provider by id. */
export function getProvider(id: AssetSearchProviderId): AssetSearchProvider | undefined {
  return buildProviderMap().get(id);
}

/** Returns immutable registered providers. */
export function getProviders(): readonly AssetSearchProvider[] {
  return Object.freeze(buildRegisteredProviders());
}

/** Returns immutable provider metadata by id. */
export function getProviderMetadata(
  id: AssetSearchProviderId,
): AssetSearchProviderMetadata | undefined {
  return METADATA_MAP.get(id);
}

/** Returns the full immutable metadata catalog. */
export function getProviderMetadataCatalog(): readonly AssetSearchProviderMetadata[] {
  return PROVIDER_METADATA_CATALOG;
}

/** Returns registered provider ids in registration order. */
export function listRegisteredProviderIds(): AssetSearchProviderId[] {
  return buildRegisteredProviders().map((provider) => provider.id);
}

/** Ranks providers by capability metadata — no execution. */
export function resolveProvidersByCapability(
  requirement: ProviderCapabilityRequirement,
): ProviderCapabilityMatch[] {
  return rankProvidersByCapabilityMetadata(PROVIDER_METADATA_CATALOG, requirement);
}

function uniqueProviderIds(ids: AssetSearchProviderId[]): AssetSearchProviderId[] {
  const seen = new Set<AssetSearchProviderId>();
  const ordered: AssetSearchProviderId[] = [];

  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    ordered.push(id);
  }

  return ordered;
}

/**
 * Resolves provider execution order from planning-ranked providers.
 * Unregistered ids are preserved for diagnostics but skipped at execution time.
 * Mock provider is appended as the final fallback when not already present.
 */
export function resolveProviderOrder(input: {
  rankedProviderIds?: AssetProviderId[];
  rankedPriorities?: AssetProviderPriority[];
}): AssetSearchProviderId[] {
  const ranked = input.rankedProviderIds ?? [];

  if (ranked.length === 0) {
    return [MOCK_ASSET_SEARCH_PROVIDER_ID];
  }

  const withPriority = ranked.map((providerId, index) => ({
    providerId: providerId as AssetSearchProviderId,
    priority: input.rankedPriorities?.[index] ?? "planning_only",
  }));

  withPriority.sort((left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority]);

  const orderedIds = uniqueProviderIds(withPriority.map((entry) => entry.providerId));

  if (!orderedIds.includes(MOCK_ASSET_SEARCH_PROVIDER_ID)) {
    orderedIds.push(MOCK_ASSET_SEARCH_PROVIDER_ID);
  }

  return orderedIds;
}

/** Default platform order when planning metadata is unavailable. */
export function resolveDefaultProviderOrder(): AssetSearchProviderId[] {
  return [...DEFAULT_EXECUTION_ORDER];
}
