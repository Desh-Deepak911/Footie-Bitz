import type {
  AssetSearchOrientation,
  NormalizedAssetResult,
} from "@/features/asset-search/orchestrator";

import type {
  AssetBrowserEmptyStateKind,
  AssetBrowserFilters,
  AssetBrowserSearchRequest,
  AssetBrowserSearchResponse,
  AssetBrowserSort,
} from "./asset-browser.types";
import { ASSET_BROWSER_DEBOUNCE_MS } from "./asset-browser.types";

/** Client visibility gate — mirrors ASSET_SEARCH_ENABLED via NEXT_PUBLIC for browser UI. */
export function isAssetBrowserVisible(): boolean {
  return (
    process.env.NEXT_PUBLIC_ASSET_SEARCH_ENABLED === "true" ||
    process.env.ASSET_SEARCH_ENABLED === "true"
  );
}

export function formatProviderDisplayName(providerId: string): string {
  if (providerId === "mock") {
    return "Mock";
  }

  return providerId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatLicenseBadgeLabel(licenseType: string): string {
  switch (licenseType) {
    case "commercial":
      return "Commercial";
    case "creative_commons":
      return "Creative Commons";
    case "editorial":
      return "Editorial";
    case "platform":
      return "Platform";
    default:
      return "License";
  }
}

export function formatOrientationLabel(orientation?: AssetSearchOrientation): string {
  if (!orientation || orientation === "any") {
    return "Any";
  }

  return orientation.charAt(0).toUpperCase() + orientation.slice(1);
}

export function formatDimensions(asset: NormalizedAssetResult): string | null {
  if (!asset.width || !asset.height) {
    return null;
  }

  return `${asset.width} × ${asset.height}`;
}

export function formatScoreLabel(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function resolveEmptyStateKind(input: {
  query: string;
  disabledReason?: string;
  success: boolean;
  resultCount: number;
  error?: string;
}): AssetBrowserEmptyStateKind {
  if (input.disabledReason?.includes("ASSET_SEARCH_ENABLED")) {
    return "search_disabled";
  }

  if (!input.query.trim()) {
    return "missing_query";
  }

  if (!input.success && input.resultCount === 0) {
    return "provider_unavailable";
  }

  if (input.resultCount === 0) {
    return "no_results";
  }

  return "none";
}

export function applyAssetBrowserFilters(
  results: NormalizedAssetResult[],
  filters: AssetBrowserFilters,
): NormalizedAssetResult[] {
  let filtered = [...results];

  if (filters.providerId !== "all") {
    filtered = filtered.filter((asset) => asset.providerId === filters.providerId);
  }

  if (filters.orientation !== "all") {
    filtered = filtered.filter(
      (asset) => asset.orientation === filters.orientation || asset.orientation === "any",
    );
  }

  if (filters.license !== "all") {
    filtered = filtered.filter((asset) => {
      if (filters.license === "commercial") {
        return asset.license.commercialUse && !asset.license.editorialOnly;
      }

      if (filters.license === "editorial") {
        return asset.license.editorialOnly || asset.license.licenseType === "editorial";
      }

      if (filters.license === "creative_commons") {
        return asset.license.licenseType === "creative_commons";
      }

      return true;
    });
  }

  return sortAssetBrowserResults(filtered, filters.sort);
}

export function sortAssetBrowserResults(
  results: NormalizedAssetResult[],
  sort: AssetBrowserSort,
): NormalizedAssetResult[] {
  const sorted = [...results];

  if (sort === "score") {
    sorted.sort((left, right) => right.score - left.score);
    return sorted;
  }

  if (sort === "newest") {
    sorted.sort((left, right) => {
      const leftIndex = typeof left.metadata.itemIndex === "number" ? left.metadata.itemIndex : 0;
      const rightIndex = typeof right.metadata.itemIndex === "number" ? right.metadata.itemIndex : 0;
      return rightIndex - leftIndex;
    });
    return sorted;
  }

  return sorted;
}

export function resolveDebouncedQuery(query: string, debouncedQuery: string): boolean {
  return query.trim() === debouncedQuery.trim();
}

export function createAssetBrowserDebounce(delayMs = ASSET_BROWSER_DEBOUNCE_MS) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule(callback: () => void) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
        callback();
      }, delayMs);
    },
    cancel() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}

export function resolveOrchestratorOrientation(
  filters: AssetBrowserFilters,
): AssetSearchOrientation {
  return filters.orientation === "all" ? "any" : filters.orientation;
}

export async function fetchAssetBrowserResults(
  request: AssetBrowserSearchRequest,
): Promise<AssetBrowserSearchResponse> {
  const response = await fetch("/api/search-assets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storyId: request.context.storyId,
      sceneId: request.context.sceneId,
      sceneIndex: request.context.sceneIndex,
      query: request.query,
      recommendation: request.context.recommendation,
      providerResult: request.context.providerResult,
      orientation: request.orientation,
      page: request.page,
      limit: request.limit,
      safeSearch: true,
      licensePreference: "any",
      semanticSlot: request.semanticSlot,
      visualIntent: request.visualIntent,
    }),
  });

  const payload = (await response.json()) as AssetBrowserSearchResponse & { error?: string };

  if (!response.ok) {
    return {
      success: false,
      query: request.query,
      results: [],
      page: request.page,
      limit: request.limit,
      totalResults: 0,
      hasNextPage: false,
      error: payload.error ?? "Asset search request failed",
      disabledReason: payload.disabledReason,
    };
  }

  return payload;
}

export function assertNoProviderPayloadLeak(value: unknown): boolean {
  const serialized = JSON.stringify(value);
  const forbidden = ["photographer_url", "photographer_id", "avg_color", "photos", "pexelsPhotoId"];
  return !forbidden.some((token) => serialized.includes(token));
}
