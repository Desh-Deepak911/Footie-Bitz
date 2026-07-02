import type {
  AssetMaterializationResult as AttachMaterializationResult,
  MaterializeAssetUrlFn,
} from "@/features/asset-attach/asset-attach.types";
import type { AssetSearchProviderId } from "@/features/asset-search/orchestrator";

import type {
  AssetMaterializationPreferredResolution,
  AssetMaterializationResult,
  AssetMaterializationStrategy,
} from "./asset-materialization.types";

export interface MaterializeAssetApiInput {
  providerId: AssetSearchProviderId;
  previewUrl: string;
  fullResolutionUrl: string;
  preferredResolution?: AssetMaterializationPreferredResolution;
  mimeType?: string;
}

export interface MaterializeAssetApiResult {
  success: boolean;
  playableUrl?: string;
  strategy: AssetMaterializationStrategy;
  mimeType?: string;
  width?: number;
  height?: number;
  warnings: string[];
  error?: string;
}

export type MaterializeAssetApiFetchFn = typeof fetch;

/** Client-safe POST helper for `/api/assets/materialize`. */
export async function materializeAssetViaApi(
  input: MaterializeAssetApiInput,
  fetchFn: MaterializeAssetApiFetchFn = fetch,
): Promise<MaterializeAssetApiResult> {
  const response = await fetchFn("/api/assets/materialize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      providerId: input.providerId,
      previewUrl: input.previewUrl,
      fullResolutionUrl: input.fullResolutionUrl,
      preferredResolution: input.preferredResolution,
      mimeType: input.mimeType,
    }),
  });

  let payload: AssetMaterializationResult & { error?: string };

  try {
    payload = (await response.json()) as AssetMaterializationResult & { error?: string };
  } catch {
    return {
      success: false,
      strategy: "unsupported",
      warnings: [],
      error: "Asset materialization returned an invalid response.",
    };
  }

  if (!response.ok && !payload.success) {
    return {
      success: false,
      strategy: payload.strategy ?? "unsupported",
      mimeType: payload.mimeType,
      width: payload.width,
      height: payload.height,
      warnings: payload.warnings ?? [],
      error: payload.error ?? "Asset materialization failed.",
    };
  }

  return {
    success: payload.success,
    playableUrl: payload.playableUrl,
    strategy: payload.strategy,
    mimeType: payload.mimeType,
    width: payload.width,
    height: payload.height,
    warnings: payload.warnings ?? [],
    error: payload.error,
  };
}

/** Maps server materialization strategy into attach-layer strategy names. */
export function mapMaterializationStrategyToAttach(
  strategy: AssetMaterializationStrategy,
): AttachMaterializationResult["strategy"] {
  switch (strategy) {
    case "data_url":
      return "data_url";
    case "blob":
      return "blob";
    case "temporary_url":
      return "remote";
    default:
      return "remote";
  }
}

/** Adapts API materialization output for `attachNormalizedAssetToScene`. */
export function adaptMaterializationApiResultToAttach(
  result: MaterializeAssetApiResult,
): AttachMaterializationResult {
  return {
    success: result.success,
    playableUrl: result.playableUrl,
    strategy: result.success
      ? mapMaterializationStrategyToAttach(result.strategy)
      : mapMaterializationStrategyToAttach(result.strategy ?? "unsupported"),
    persisted:
      result.success &&
      (result.strategy === "data_url" || result.strategy === "blob"),
    warnings: result.warnings,
    error: result.error,
  };
}

/** Injectable attach dependency that materializes via the server API route. */
export function createApiMaterializeAssetUrlFn(
  fetchFn: MaterializeAssetApiFetchFn = fetch,
): MaterializeAssetUrlFn {
  return async ({ asset, preferFullResolution }) => {
    const result = await materializeAssetViaApi(
      {
        providerId: asset.providerId,
        previewUrl: asset.previewUrl,
        fullResolutionUrl: asset.fullResolutionUrl,
        preferredResolution: preferFullResolution ? "full" : "preview",
      },
      fetchFn,
    );

    return adaptMaterializationApiResultToAttach(result);
  };
}
