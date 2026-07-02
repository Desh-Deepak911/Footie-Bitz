import type {
  AssetAttribution,
  AssetLicenseInfo,
  AssetSearchProviderId,
  AssetSearchRequest,
  NormalizedAssetResult,
} from "../orchestrator/asset-search.types";

/** Provider-local asset payload — normalized by the orchestrator before exposure. */
export interface AssetSearchProviderAsset {
  providerAssetId: string;
  title: string;
  description?: string;
  previewUrl: string;
  thumbnailUrl: string;
  fullResolutionUrl: string;
  width?: number;
  height?: number;
  orientation?: "landscape" | "portrait" | "square" | "any";
  tags?: string[];
  score?: number;
  metadata?: Record<string, string | number | boolean | null>;
  license?: AssetLicenseInfo;
  attribution?: AssetAttribution;
}

/** Provider execution result — may contain provider-specific fields internally. */
export interface AssetSearchProviderResult {
  providerId: AssetSearchProviderId;
  success: boolean;
  query: string;
  assets: AssetSearchProviderAsset[];
  error?: string;
  durationMs: number;
}

/** Converts provider-local assets into platform-normalized results. */
export type AssetSearchResultNormalizer = (
  result: AssetSearchProviderResult,
  request: AssetSearchRequest,
) => NormalizedAssetResult[];

export type { AssetSearchProvider } from "./provider-sdk";
