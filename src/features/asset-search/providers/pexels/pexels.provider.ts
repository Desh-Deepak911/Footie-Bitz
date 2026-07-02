import {
  ASSET_SEARCH_PROVIDER_SDK_VERSION,
  buildProviderHealth,
  freezeProviderMetadata,
  type AssetSearchProvider,
} from "../provider-sdk";
import type { AssetSearchProviderResult } from "../provider.types";
import type { AssetSearchRequest } from "../../orchestrator/asset-search.types";

import { normalizePexelsPhotos } from "./pexels.normalizer";
import {
  executePexelsSearch,
  formatPexelsFailureMessage,
  isPexelsProviderAvailable,
  isPexelsSearchExecutable,
  PEXELS_PROVIDER_ID,
  resolvePexelsApiKey,
} from "./pexels.utils";

export const PEXELS_ASSET_SEARCH_PROVIDER_METADATA = freezeProviderMetadata({
  id: PEXELS_PROVIDER_ID,
  displayName: "Pexels",
  description: "Stock photos and videos from Pexels.",
  website: "https://www.pexels.com",
  logo: "provider:pexels",
  requiresApiKey: true,
  enabledByDefault: false,
  planningOnly: false,
  priority: 10,
  version: ASSET_SEARCH_PROVIDER_SDK_VERSION,
  capabilities: {
    supportsPortrait: true,
    supportsLandscape: true,
    supportsCommercialUse: true,
    supportsVideo: true,
    supportsAction: true,
  },
  rateLimits: {
    requestsPerMinute: 200,
    requestsPerHour: 5000,
    burstLimit: 20,
    retryAfterSeconds: 60,
  },
  authentication: {
    type: "api_key",
    headerName: "Authorization",
    envKey: "PEXELS_API_KEY",
  },
});

/** Pexels asset search provider — server-side HTTP only. */
export const PexelsAssetSearchProvider: AssetSearchProvider = {
  id: PEXELS_PROVIDER_ID,
  metadata: PEXELS_ASSET_SEARCH_PROVIDER_METADATA,

  getHealth() {
    if (!resolvePexelsApiKey()) {
      return buildProviderHealth(
        "offline",
        "PEXELS_API_KEY is not configured — Pexels search is unavailable.",
      );
    }

    return buildProviderHealth("available", "Pexels connector is registered and ready.");
  },

  async search(request: AssetSearchRequest): Promise<AssetSearchProviderResult> {
    const startedAt = Date.now();
    const query = request.query.trim();

    if (!isPexelsSearchExecutable()) {
      const message = !isPexelsProviderAvailable()
        ? "PEXELS_API_KEY is not configured"
        : "Asset search is disabled (ASSET_SEARCH_ENABLED is not true)";

      return {
        providerId: PEXELS_PROVIDER_ID,
        success: false,
        query,
        assets: [],
        error: message,
        durationMs: Date.now() - startedAt,
      };
    }

    const result = await executePexelsSearch(request);
    if (!result.ok) {
      return {
        providerId: PEXELS_PROVIDER_ID,
        success: false,
        query,
        assets: [],
        error: formatPexelsFailureMessage(result.failure),
        durationMs: Date.now() - startedAt,
      };
    }

    return {
      providerId: PEXELS_PROVIDER_ID,
      success: true,
      query,
      assets: normalizePexelsPhotos(result.payload.photos),
      durationMs: Date.now() - startedAt,
    };
  },
};
