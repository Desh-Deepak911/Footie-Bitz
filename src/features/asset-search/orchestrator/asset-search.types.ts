import type { AssetProviderId } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { AssetProviderResult } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { SceneRecommendation } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";

/** Semantic version for the asset search platform contract. */
export const ASSET_SEARCH_PLATFORM_VERSION = "0.1.0";

/** Search execution provider id — includes planning ids plus platform mock. */
export type AssetSearchProviderId = AssetProviderId | "mock";

/** Preferred license filter for future provider queries. */
export type AssetLicensePreference = "any" | "commercial" | "editorial" | "creative_commons";

/** Orientation hint for search requests. */
export type AssetSearchOrientation = "landscape" | "portrait" | "square" | "any";

/** License classification for normalized assets. */
export type AssetLicenseType =
  | "commercial"
  | "creative_commons"
  | "editorial"
  | "platform"
  | "unknown";

/** Future-compatible search request — passed to provider connectors. */
export interface AssetSearchRequest {
  requestId: string;
  query: string;
  providerId: AssetSearchProviderId;
  sceneId: string;
  storyId: string;
  sceneIndex: number;
  semanticSlot?: string;
  visualIntent?: string;
  contentPattern?: string;
  entityIds: string[];
  orientation: AssetSearchOrientation;
  page: number;
  limit: number;
  safeSearch: boolean;
  licensePreference: AssetLicensePreference;
  metadata: Record<string, string | number | boolean | null>;
}

/** Normalized license metadata — stable across providers. */
export interface AssetLicenseInfo {
  licenseType: AssetLicenseType;
  requiresAttribution: boolean;
  commercialUse: boolean;
  modificationAllowed: boolean;
  editorialOnly: boolean;
  licenseUrl?: string;
}

/** Required attribution for provider compliance. */
export interface AssetAttribution {
  creatorName?: string;
  creatorUrl?: string;
  providerName: string;
  providerUrl: string;
  requiredText: string;
}

/** Canonical asset result exposed outside providers. */
export interface NormalizedAssetResult {
  id: string;
  providerId: AssetSearchProviderId;
  title: string;
  description?: string;
  previewUrl: string;
  thumbnailUrl: string;
  fullResolutionUrl: string;
  width?: number;
  height?: number;
  orientation?: AssetSearchOrientation;
  tags: string[];
  license: AssetLicenseInfo;
  attribution: AssetAttribution;
  score: number;
  metadata: Record<string, string | number | boolean | null>;
}

/** First-class orchestrator diagnostics. */
export interface AssetSearchDiagnostics {
  platformVersion: typeof ASSET_SEARCH_PLATFORM_VERSION;
  requestHash: string;
  cacheHit: boolean;
  providerAttempts: AssetSearchProviderId[];
  providerFailures: Array<{ providerId: AssetSearchProviderId; error: string }>;
  normalizedResultCount: number;
  searchDurationMs: number;
  providerOrder: AssetSearchProviderId[];
  disabledReason?: string;
  warnings: string[];
}

/** Server-side cache entry — future-compatible with Redis/Supabase. */
export interface AssetSearchCacheEntry {
  requestHash: string;
  providerId: AssetSearchProviderId;
  createdAt: string;
  expiresAt: string;
  results: NormalizedAssetResult[];
  diagnostics: AssetSearchDiagnostics;
}

/** Orchestrator input derived from cached planning recommendations. */
export interface AssetSearchOrchestratorInput {
  storyId: string;
  sceneId: string;
  sceneIndex: number;
  /** Optional query override — browser search edits bypass cached recommendation text. */
  query?: string;
  recommendation: SceneRecommendation;
  providerResult: AssetProviderResult;
  orientation?: AssetSearchOrientation;
  page?: number;
  limit?: number;
  safeSearch?: boolean;
  licensePreference?: AssetLicensePreference;
  semanticSlot?: string;
  contentPattern?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/** Orchestrator output — never throws to callers. */
export interface AssetSearchOrchestratorResult {
  success: boolean;
  query: string;
  sceneId: string;
  sceneIndex: number;
  storyId: string;
  results: NormalizedAssetResult[];
  diagnostics: AssetSearchDiagnostics;
  error?: string;
}
