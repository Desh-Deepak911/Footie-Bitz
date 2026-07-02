import type {
  AssetAttribution,
  AssetLicenseInfo,
  AssetSearchOrientation,
} from "../../orchestrator/asset-search.types";
import type { AssetSearchProviderAsset } from "../provider.types";

import type { PexelsPhoto } from "./pexels.types";
import { PEXELS_LICENSE_URL, PEXELS_PROVIDER_ID, PEXELS_WEBSITE_URL } from "./pexels.utils";

const PEXELS_PROVIDER_NAME = "Pexels";

function resolveOrientation(width: number, height: number): AssetSearchOrientation {
  if (width === height) {
    return "square";
  }

  return width > height ? "landscape" : "portrait";
}

function buildPexelsLicenseInfo(): AssetLicenseInfo {
  return {
    licenseType: "commercial",
    requiresAttribution: true,
    commercialUse: true,
    modificationAllowed: true,
    editorialOnly: false,
    licenseUrl: PEXELS_LICENSE_URL,
  };
}

function buildPexelsAttribution(photo: PexelsPhoto): AssetAttribution {
  const creatorName = photo.photographer.trim() || "Pexels Contributor";
  const providerUrl = photo.url.trim() || PEXELS_WEBSITE_URL;

  return {
    creatorName,
    creatorUrl: photo.photographer_url.trim() || PEXELS_WEBSITE_URL,
    providerName: PEXELS_PROVIDER_NAME,
    providerUrl,
    requiredText: `Photo by ${creatorName} on ${PEXELS_PROVIDER_NAME}`,
  };
}

function resolvePreviewUrl(photo: PexelsPhoto): string {
  return photo.src.large || photo.src.medium || photo.src.original;
}

function resolveThumbnailUrl(photo: PexelsPhoto): string {
  return photo.src.medium || photo.src.small || photo.src.tiny || resolvePreviewUrl(photo);
}

function resolveFullResolutionUrl(photo: PexelsPhoto): string {
  return photo.src.original || photo.src.large2x || photo.src.large;
}

/** Normalizes a single Pexels photo into a provider-local asset. */
export function normalizePexelsPhoto(photo: PexelsPhoto, index: number): AssetSearchProviderAsset {
  const title = photo.alt?.trim() || `Pexels photo ${photo.id}`;
  const orientation = resolveOrientation(photo.width, photo.height);

  return {
    providerAssetId: String(photo.id),
    title,
    description: title,
    previewUrl: resolvePreviewUrl(photo),
    thumbnailUrl: resolveThumbnailUrl(photo),
    fullResolutionUrl: resolveFullResolutionUrl(photo),
    width: photo.width,
    height: photo.height,
    orientation,
    tags: [PEXELS_PROVIDER_ID],
    score: Math.max(0.25, 1 - index * 0.04),
    license: buildPexelsLicenseInfo(),
    attribution: buildPexelsAttribution(photo),
    metadata: {
      provider: PEXELS_PROVIDER_ID,
      pexelsPhotoId: photo.id,
      avgColor: photo.avg_color ?? null,
    },
  };
}

/** Normalizes Pexels photos into provider-local assets — no raw payload fields. */
export function normalizePexelsPhotos(photos: PexelsPhoto[]): AssetSearchProviderAsset[] {
  return photos.map((photo, index) => normalizePexelsPhoto(photo, index));
}
