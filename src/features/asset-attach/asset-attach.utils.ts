import type { NormalizedAssetResult } from "@/features/asset-search/orchestrator";

import type {
  AssetAttachHandoff,
  AssetAttachMetadata,
  AssetAttachSource,
  AssetAttributionMetadata,
  AssetMaterializationResult,
} from "./asset-attach.types";

/** Maps normalized asset attribution and license into attach-time metadata. */
export function mapNormalizedAssetToAttribution(
  asset: Readonly<NormalizedAssetResult>,
): AssetAttributionMetadata {
  return {
    providerName: asset.attribution.providerName,
    providerUrl: asset.attribution.providerUrl,
    creatorName: asset.attribution.creatorName,
    creatorUrl: asset.attribution.creatorUrl,
    requiredText: asset.attribution.requiredText,
    licenseType: asset.license.licenseType,
    licenseUrl: asset.license.licenseUrl,
    requiresAttribution: asset.license.requiresAttribution,
    commercialUse: asset.license.commercialUse,
    editorialOnly: asset.license.editorialOnly,
  };
}

/** Builds persisted scene attachment metadata from a normalized asset snapshot. */
export function buildAssetAttachMetadata(input: {
  asset: Readonly<NormalizedAssetResult>;
  source: AssetAttachSource;
  handoff?: AssetAttachHandoff;
  materialization: Pick<AssetMaterializationResult, "strategy" | "persisted">;
  attachedAt?: string;
}): AssetAttachMetadata {
  const previewUrl = resolveAssetPreviewUrl(input.asset);
  const fullResolutionUrl = resolveAssetFullResolutionUrl(input.asset);

  return {
    attachSource: input.source,
    normalizedAssetId: input.asset.id,
    providerId: input.asset.providerId,
    title: input.asset.title,
    sourcePreviewUrl: previewUrl,
    sourceFullResolutionUrl: fullResolutionUrl,
    attribution: mapNormalizedAssetToAttribution(input.asset),
    attachedAt: input.attachedAt ?? new Date().toISOString(),
    ...(input.handoff ? { handoff: input.handoff } : {}),
    materialization: {
      strategy: input.materialization.strategy,
      persisted: input.materialization.persisted ?? false,
    },
  };
}

/** Returns whether the asset exposes at least one usable source URL. */
export function assetHasAttachableUrls(asset: Readonly<NormalizedAssetResult>): boolean {
  return resolveAssetMaterializationUrl(asset) != null;
}

/** Resolves the preferred URL to send to the materializer. */
export function resolveAssetMaterializationUrl(
  asset: Readonly<NormalizedAssetResult>,
  preferFullResolution = false,
): string | null {
  const previewUrl = resolveAssetPreviewUrl(asset);
  const fullResolutionUrl = resolveAssetFullResolutionUrl(asset);

  if (preferFullResolution) {
    return fullResolutionUrl || previewUrl || null;
  }

  return previewUrl || fullResolutionUrl || null;
}

function resolveAssetPreviewUrl(asset: Readonly<NormalizedAssetResult>): string {
  return asset.previewUrl.trim() || asset.thumbnailUrl.trim();
}

function resolveAssetFullResolutionUrl(asset: Readonly<NormalizedAssetResult>): string {
  return asset.fullResolutionUrl.trim() || resolveAssetPreviewUrl(asset);
}
