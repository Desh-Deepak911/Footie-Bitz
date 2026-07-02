import type { AssetSearchOrientation, AssetSearchRequest } from "../../orchestrator/asset-search.types";
import { isAssetSearchEnabled } from "../../orchestrator/asset-search.utils";

import type { PexelsSearchFailure, PexelsSearchResponse } from "./pexels.types";

export const PEXELS_SEARCH_API_BASE = "https://api.pexels.com/v1/search";
export const PEXELS_PROVIDER_ID = "pexels" as const;
export const PEXELS_LICENSE_URL = "https://www.pexels.com/license/";
export const PEXELS_WEBSITE_URL = "https://www.pexels.com";

const FETCH_KEY = "fetch";
const MAX_PER_PAGE = 80;

type HttpFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

let pexelsFetchOverride: HttpFetch | null = null;

function resolveHttpFetch(): HttpFetch {
  if (pexelsFetchOverride) {
    return pexelsFetchOverride;
  }

  const bound = (globalThis as unknown as Record<string, HttpFetch | undefined>)[FETCH_KEY];
  if (!bound) {
    throw new Error("fetch is not available in this runtime");
  }

  return bound.bind(globalThis) as HttpFetch;
}

/** Test hook — inject mock fetch without exposing raw Pexels payloads. */
export function setPexelsFetchForTests(fetchFn: HttpFetch | null): void {
  pexelsFetchOverride = fetchFn;
}

/** Returns whether Pexels can be registered as an executable provider. */
export function isPexelsProviderAvailable(): boolean {
  return Boolean(resolvePexelsApiKey());
}

/** Returns whether Pexels search may execute (feature flag + API key). */
export function isPexelsSearchExecutable(): boolean {
  return isAssetSearchEnabled() && isPexelsProviderAvailable();
}

/** Reads the Pexels API key from environment — server-side only. */
export function resolvePexelsApiKey(): string | undefined {
  const value = process.env.PEXELS_API_KEY?.trim();
  return value ? value : undefined;
}

function clampPerPage(limit: number): number {
  return Math.max(1, Math.min(limit, MAX_PER_PAGE));
}

function mapOrientationToPexelsParam(
  orientation: AssetSearchOrientation,
): "landscape" | "portrait" | "square" | undefined {
  if (orientation === "landscape" || orientation === "portrait" || orientation === "square") {
    return orientation;
  }

  return undefined;
}

/** Builds the Pexels search URL from a platform request. */
export function buildPexelsSearchUrl(request: AssetSearchRequest): string {
  const url = new URL(PEXELS_SEARCH_API_BASE);
  url.searchParams.set("query", request.query.trim());
  url.searchParams.set("page", String(Math.max(1, request.page)));
  url.searchParams.set("per_page", String(clampPerPage(request.limit)));

  const orientation = mapOrientationToPexelsParam(request.orientation);
  if (orientation) {
    url.searchParams.set("orientation", orientation);
  }

  return url.toString();
}

function parseRetryAfterSeconds(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) {
    return undefined;
  }

  const seconds = Number.parseInt(header, 10);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function buildFailure(input: PexelsSearchFailure): PexelsSearchFailure {
  return input;
}

/** Executes a Pexels search request — never throws. */
export async function executePexelsSearch(
  request: AssetSearchRequest,
): Promise<
  | { ok: true; payload: PexelsSearchResponse }
  | { ok: false; failure: PexelsSearchFailure }
> {
  if (!isAssetSearchEnabled()) {
    return {
      ok: false,
      failure: buildFailure({
        code: "search_disabled",
        message: "Asset search is disabled (ASSET_SEARCH_ENABLED is not true)",
      }),
    };
  }

  const apiKey = resolvePexelsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      failure: buildFailure({
        code: "missing_api_key",
        message: "PEXELS_API_KEY is not configured",
      }),
    };
  }

  const query = request.query.trim();
  if (!query) {
    return {
      ok: false,
      failure: buildFailure({
        code: "empty_query",
        message: "search query is required",
      }),
    };
  }

  const url = buildPexelsSearchUrl(request);

  try {
    const response = await resolveHttpFetch()(url, {
      method: "GET",
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        failure: buildFailure({
          code: "auth_failure",
          message: `Pexels authentication failed (${response.status})`,
          status: response.status,
        }),
      };
    }

    if (response.status === 429) {
      return {
        ok: false,
        failure: buildFailure({
          code: "rate_limited",
          message: "Pexels rate limit exceeded (429)",
          status: response.status,
          retryAfterSeconds: parseRetryAfterSeconds(response),
        }),
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        failure: buildFailure({
          code: "http_error",
          message: `Pexels search failed (${response.status})`,
          status: response.status,
        }),
      };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return {
        ok: false,
        failure: buildFailure({
          code: "malformed_response",
          message: "Pexels response was not valid JSON",
          status: response.status,
        }),
      };
    }

    const parsed = parsePexelsSearchResponse(payload);
    if (!parsed.ok) {
      return parsed;
    }

    if (parsed.payload.photos.length === 0) {
      return {
        ok: false,
        failure: buildFailure({
          code: "empty_results",
          message: "Pexels returned no photos for this query",
        }),
      };
    }

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "network request failed";
    return {
      ok: false,
      failure: buildFailure({
        code: "network_error",
        message: `Pexels network error: ${message}`,
      }),
    };
  }
}

/** Validates and parses a Pexels search JSON payload. */
export function parsePexelsSearchResponse(
  payload: unknown,
):
  | { ok: true; payload: PexelsSearchResponse }
  | { ok: false; failure: PexelsSearchFailure } {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      failure: buildFailure({
        code: "malformed_response",
        message: "Pexels response payload was not an object",
      }),
    };
  }

  const record = payload as Record<string, unknown>;
  if (!Array.isArray(record.photos)) {
    return {
      ok: false,
      failure: buildFailure({
        code: "malformed_response",
        message: "Pexels response missing photos array",
      }),
    };
  }

  const photos = record.photos.filter(isPexelsPhotoRecord);
  if (photos.length !== record.photos.length) {
    return {
      ok: false,
      failure: buildFailure({
        code: "malformed_response",
        message: "Pexels response contained invalid photo entries",
      }),
    };
  }

  return {
    ok: true,
    payload: {
      page: typeof record.page === "number" ? record.page : 1,
      per_page: typeof record.per_page === "number" ? record.per_page : photos.length,
      photos,
      total_results: typeof record.total_results === "number" ? record.total_results : photos.length,
      next_page: typeof record.next_page === "string" ? record.next_page : undefined,
    },
  };
}

function isPexelsPhotoRecord(value: unknown): value is PexelsSearchResponse["photos"][number] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const photo = value as Record<string, unknown>;
  const src = photo.src;
  if (!src || typeof src !== "object") {
    return false;
  }

  const srcRecord = src as Record<string, unknown>;
  return (
    typeof photo.id === "number" &&
    typeof photo.url === "string" &&
    typeof photo.photographer === "string" &&
    typeof photo.photographer_url === "string" &&
    typeof photo.width === "number" &&
    typeof photo.height === "number" &&
    typeof srcRecord.large === "string" &&
    typeof srcRecord.medium === "string" &&
    typeof srcRecord.small === "string" &&
    typeof srcRecord.original === "string"
  );
}

/** Maps Pexels failures to provider error strings for orchestrator diagnostics. */
export function formatPexelsFailureMessage(failure: PexelsSearchFailure): string {
  if (failure.retryAfterSeconds !== undefined) {
    return `${failure.message}; retry after ${failure.retryAfterSeconds}s`;
  }

  return failure.message;
}
