import type {
  AssetSearchProviderAsset,
  AssetSearchProviderResult,
} from "../provider.types";
import type { AssetSearchProviderId, AssetSearchRequest } from "../../orchestrator/asset-search.types";

/** Semantic version for the asset search provider SDK contract. */
export const ASSET_SEARCH_PROVIDER_SDK_VERSION = "0.1.0";

/** Provider health status values. */
export type ProviderHealthStatus = "available" | "degraded" | "offline" | "planning_only";

/** Supported authentication strategies — metadata only in 3.8B. */
export type ProviderAuthenticationType = "none" | "api_key" | "oauth" | "bearer_token";

/** Extensible provider capability flags — future providers add keys without schema changes. */
export interface ProviderCapabilities {
  supportsPortrait?: boolean;
  supportsAction?: boolean;
  supportsHistorical?: boolean;
  supportsIllustrations?: boolean;
  supportsTransparentBackground?: boolean;
  supportsEditorial?: boolean;
  supportsCommercialUse?: boolean;
  supportsLandscape?: boolean;
  supportsSquare?: boolean;
  supportsVertical?: boolean;
  supportsVideo?: boolean;
  supportsAI?: boolean;
  supportsArchive?: boolean;
  [capability: string]: boolean | undefined;
}

/** Authentication metadata — not executed in 3.8B. */
export interface ProviderAuthentication {
  type: ProviderAuthenticationType;
  headerName?: string;
  envKey?: string;
  notes?: string;
}

/** Rate-limit metadata — not enforced in 3.8B. */
export interface ProviderRateLimit {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  burstLimit?: number;
  retryAfterSeconds?: number;
}

/** Immutable provider metadata exposed by every SDK provider. */
export interface AssetSearchProviderMetadata {
  id: AssetSearchProviderId;
  displayName: string;
  description: string;
  website: string;
  /** Logo identifier only — no binary assets in 3.8B. */
  logo: string;
  requiresApiKey: boolean;
  enabledByDefault: boolean;
  planningOnly: boolean;
  priority: number;
  version: string;
  capabilities: ProviderCapabilities;
  rateLimits: ProviderRateLimit;
  authentication: ProviderAuthentication;
}

/** Runtime health snapshot for a provider. */
export interface ProviderHealth {
  status: ProviderHealthStatus;
  message?: string;
  checkedAt: string;
}

/** Optional search execution context for future provider connectors. */
export interface ProviderSearchContext {
  storyId?: string;
  sceneId?: string;
  sceneIndex?: number;
  requestHash?: string;
  locale?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/** Structured provider error metadata. */
export interface ProviderError {
  code: string;
  message: string;
  retryable: boolean;
  providerId: AssetSearchProviderId;
  status?: ProviderHealthStatus;
}

/** SDK-level search result alias — maps to provider execution payload. */
export type ProviderSearchResult = AssetSearchProviderResult;

/** Contract every asset search provider must implement. */
export interface AssetSearchProvider {
  readonly id: AssetSearchProviderId;
  readonly metadata: AssetSearchProviderMetadata;
  getHealth(): ProviderHealth;
  search(
    request: AssetSearchRequest,
    context?: ProviderSearchContext,
  ): Promise<ProviderSearchResult>;
}

/** Requirement input for capability-based provider resolution. */
export interface ProviderCapabilityRequirement {
  required?: ProviderCapabilities;
  preferred?: ProviderCapabilities;
  minimumMatches?: number;
}

/** Ranked provider metadata from capability resolution. */
export interface ProviderCapabilityMatch {
  metadata: AssetSearchProviderMetadata;
  score: number;
  matchedCapabilities: string[];
  missingCapabilities: string[];
}

/** Re-export execution asset shape for SDK consumers. */
export type { AssetSearchProviderAsset };
