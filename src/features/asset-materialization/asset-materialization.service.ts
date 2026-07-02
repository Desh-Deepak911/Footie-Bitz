import "server-only";

import type {
  AssetMaterializationRequest,
  AssetMaterializationResult,
  MaterializationFetchFn,
  MaterializeAssetImageDependencies,
} from "./asset-materialization.types";
import {
  readAssetMaterializationCache,
  writeAssetMaterializationCache,
} from "./asset-materialization.cache";
import {
  buildAssetMaterializationCacheKey,
  buildDataUrlPlayableUrl,
  DEFAULT_MATERIALIZATION_MAX_BYTES,
  DEFAULT_MATERIALIZATION_TIMEOUT_MS,
  isDataUrl,
  isHttpUrl,
  isSupportedImageMimeType,
  normalizeMimeType,
  parseImageDimensions,
  readResponseBytesWithLimit,
  resolveMaterializationSourceUrl,
  resolveValidatedImageMimeType,
  sniffImageMimeType,
} from "./asset-materialization.utils";

let fetchOverride: MaterializationFetchFn | null = null;
let timeoutOverrideMs: number | null = null;
let maxBytesOverride: number | null = null;

/** Injects fetch for verification — production uses global fetch. */
export function setMaterializationFetchForTests(fetchFn: MaterializationFetchFn | null): void {
  fetchOverride = fetchFn;
}

/** Overrides timeout for verification only. */
export function setMaterializationTimeoutMsForTests(timeoutMs: number | null): void {
  timeoutOverrideMs = timeoutMs;
}

/** Overrides max byte limit for verification only. */
export function setMaterializationMaxBytesForTests(maxBytes: number | null): void {
  maxBytesOverride = maxBytes;
}

function resolveFetch(deps?: MaterializeAssetImageDependencies): MaterializationFetchFn {
  return deps?.fetch ?? fetchOverride ?? fetch;
}

function resolveTimeoutMs(deps?: MaterializeAssetImageDependencies): number {
  return deps?.timeoutMs ?? timeoutOverrideMs ?? DEFAULT_MATERIALIZATION_TIMEOUT_MS;
}

function resolveMaxBytes(deps?: MaterializeAssetImageDependencies): number {
  return deps?.maxBytes ?? maxBytesOverride ?? DEFAULT_MATERIALIZATION_MAX_BYTES;
}

function failureResult(
  error: string,
  warnings: string[] = [],
  strategy: AssetMaterializationResult["strategy"] = "unsupported",
): AssetMaterializationResult {
  return {
    success: false,
    strategy,
    warnings,
    error,
  };
}

function successResult(input: {
  playableUrl: string;
  strategy: AssetMaterializationResult["strategy"];
  mimeType: string;
  width?: number;
  height?: number;
  warnings?: string[];
  cacheHit?: boolean;
}): AssetMaterializationResult {
  return {
    success: true,
    playableUrl: input.playableUrl,
    strategy: input.strategy,
    mimeType: input.mimeType,
    width: input.width,
    height: input.height,
    warnings: input.warnings ?? [],
    cacheHit: input.cacheHit,
  };
}

function materializeDataUrlSource(
  sourceUrl: string,
  hintedMimeType?: string,
): AssetMaterializationResult {
  const mimeType = normalizeMimeType(sourceUrl.slice(5).split(";")[0]);
  if (!mimeType || !isSupportedImageMimeType(mimeType)) {
    return failureResult("data URL uses an unsupported image format");
  }

  if (hintedMimeType) {
    const hinted = normalizeMimeType(hintedMimeType);
    if (hinted && hinted !== mimeType) {
      return failureResult("declared mimeType does not match data URL content");
    }
  }

  try {
    const base64Payload = sourceUrl.split(",")[1] ?? "";
    const buffer = Uint8Array.from(Buffer.from(base64Payload, "base64"));
    const sniffed = sniffImageMimeType(buffer);
    const validated = resolveValidatedImageMimeType({
      headerMimeType: mimeType,
      sniffedMimeType: sniffed,
      hintedMimeType,
    });

    if (!validated) {
      return failureResult("data URL content failed image validation");
    }

    const dimensions = parseImageDimensions(buffer, validated);
    return successResult({
      playableUrl: sourceUrl,
      strategy: "temporary_url",
      mimeType: validated,
      width: dimensions.width,
      height: dimensions.height,
    });
  } catch {
    return failureResult("data URL could not be decoded");
  }
}

async function fetchRemoteImage(
  sourceUrl: string,
  deps: MaterializeAssetImageDependencies | undefined,
  hintedMimeType?: string,
): Promise<AssetMaterializationResult> {
  const fetchFn = resolveFetch(deps);
  const timeoutMs = resolveTimeoutMs(deps);
  const maxBytes = resolveMaxBytes(deps);

  let response: Response;

  try {
    response = await fetchFn(sourceUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "remote image fetch failed";
    if (message.toLowerCase().includes("timeout") || message.includes("aborted")) {
      return failureResult(`materialization timed out after ${timeoutMs}ms`);
    }

    return failureResult(message);
  }

  if (!response.ok) {
    return failureResult(`remote image fetch failed with status ${response.status}`);
  }

  let buffer: Uint8Array;

  try {
    buffer = await readResponseBytesWithLimit(response, maxBytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to read remote image";
    return failureResult(message);
  }

  const sniffedMimeType = sniffImageMimeType(buffer);
  const validatedMimeType = resolveValidatedImageMimeType({
    headerMimeType: normalizeMimeType(response.headers.get("content-type")),
    sniffedMimeType,
    hintedMimeType,
  });

  if (!validatedMimeType) {
    return failureResult("remote image has an unsupported or invalid mime type");
  }

  const dimensions = parseImageDimensions(buffer, validatedMimeType);
  const playableUrl = buildDataUrlPlayableUrl(validatedMimeType, buffer);

  return successResult({
    playableUrl,
    strategy: "data_url",
    mimeType: validatedMimeType,
    width: dimensions.width,
    height: dimensions.height,
  });
}

/**
 * Materializes an external provider asset into an export-safe playable URL.
 * Does not mutate drafts, attach to scenes, or call provider SDKs.
 */
export async function materializeAssetImage(
  request: AssetMaterializationRequest,
  deps?: MaterializeAssetImageDependencies,
): Promise<AssetMaterializationResult> {
  const providerId = request.providerId?.trim();
  const previewUrl = request.previewUrl?.trim();
  const fullResolutionUrl = request.fullResolutionUrl?.trim();
  const preferredResolution = request.preferredResolution ?? "preview";

  if (!providerId) {
    return failureResult("providerId is required");
  }

  if (!previewUrl && !fullResolutionUrl) {
    return failureResult("previewUrl or fullResolutionUrl is required");
  }

  const cacheKey = buildAssetMaterializationCacheKey({
    providerId,
    fullResolutionUrl: fullResolutionUrl || previewUrl,
    preferredResolution,
  });

  const cached = readAssetMaterializationCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      cacheHit: true,
      warnings: [...cached.warnings, "materialization served from cache"],
    };
  }

  const sourceUrl = resolveMaterializationSourceUrl({
    previewUrl,
    fullResolutionUrl,
    preferredResolution,
  });

  if (!sourceUrl) {
    return failureResult("no materialization source URL is available");
  }

  let result: AssetMaterializationResult;

  if (isDataUrl(sourceUrl)) {
    result = materializeDataUrlSource(sourceUrl, request.mimeType);
  } else if (!isHttpUrl(sourceUrl)) {
    result = failureResult("materialization source URL must be http(s) or data URL");
  } else {
    result = await fetchRemoteImage(sourceUrl, deps, request.mimeType);
  }

  if (result.success) {
    writeAssetMaterializationCache({
      cacheKey,
      result,
    });
  }

  return result;
}
