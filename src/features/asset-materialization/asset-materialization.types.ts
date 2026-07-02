import type { AssetSearchProviderId } from "@/features/asset-search/orchestrator";

/** How a remote asset was converted into a playable scene image URL. */
export type AssetMaterializationStrategy =
  | "blob"
  | "data_url"
  | "temporary_url"
  | "unsupported";

/** Which source URL to prefer when materializing. */
export type AssetMaterializationPreferredResolution = "preview" | "full";

/** Server-side materialization request — no scene or draft mutation. */
export interface AssetMaterializationRequest {
  providerId: AssetSearchProviderId;
  previewUrl: string;
  fullResolutionUrl: string;
  preferredResolution?: AssetMaterializationPreferredResolution;
  mimeType?: string;
}

/** Materialization output returned by the service and API route. */
export interface AssetMaterializationResult {
  success: boolean;
  playableUrl?: string;
  strategy: AssetMaterializationStrategy;
  mimeType?: string;
  width?: number;
  height?: number;
  warnings: string[];
  error?: string;
  cacheHit?: boolean;
}

export interface AssetMaterializationCacheEntry {
  cacheKey: string;
  createdAt: string;
  expiresAt: string;
  result: AssetMaterializationResult;
}

export type MaterializationFetchFn = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface MaterializeAssetImageDependencies {
  fetch?: MaterializationFetchFn;
  timeoutMs?: number;
  maxBytes?: number;
}
