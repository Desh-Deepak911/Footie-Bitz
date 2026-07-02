import "server-only";

import { NextResponse } from "next/server";

import type { AssetProviderResult } from "@/features/asset-intelligence/providers/asset-provider.types";
import type { SceneRecommendation } from "@/features/asset-intelligence/recommendation-engine/recommendation-engine.types";
import {
  isAssetSearchEnabled,
  runAssetSearchOrchestrator,
  type AssetLicensePreference,
  type AssetSearchOrientation,
  type NormalizedAssetResult,
} from "@/features/asset-search/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_LIMIT = 12;
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 24;

interface SearchAssetsRequestBody {
  storyId?: string;
  sceneId?: string;
  sceneIndex?: number;
  query?: string;
  recommendation?: SceneRecommendation;
  providerResult?: AssetProviderResult;
  orientation?: AssetSearchOrientation;
  page?: number;
  limit?: number;
  safeSearch?: boolean;
  licensePreference?: AssetLicensePreference;
  semanticSlot?: string;
  visualIntent?: string;
}

export interface SearchAssetsResponse {
  success: boolean;
  query: string;
  storyId: string;
  sceneId: string;
  sceneIndex: number;
  results: NormalizedAssetResult[];
  page: number;
  limit: number;
  totalResults: number;
  hasNextPage: boolean;
  error?: string;
  disabledReason?: string;
}

function clampLimit(limit: unknown): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(Math.trunc(limit), MAX_LIMIT));
}

function clampPage(page: unknown): number {
  if (typeof page !== "number" || !Number.isFinite(page)) {
    return DEFAULT_PAGE;
  }

  return Math.max(1, Math.trunc(page));
}

function estimatePagination(page: number, limit: number, resultCount: number) {
  const minimumTotal = (page - 1) * limit + resultCount;
  const hasNextPage = resultCount >= limit;

  return {
    totalResults: hasNextPage ? minimumTotal + 1 : minimumTotal,
    hasNextPage,
  };
}

export async function POST(request: Request) {
  if (!isAssetSearchEnabled()) {
    const response: SearchAssetsResponse = {
      success: false,
      query: "",
      storyId: "",
      sceneId: "",
      sceneIndex: 0,
      results: [],
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      totalResults: 0,
      hasNextPage: false,
      disabledReason: "ASSET_SEARCH_ENABLED is not true",
      error: "Asset search is disabled",
    };

    return NextResponse.json(response, { status: 503 });
  }

  let body: SearchAssetsRequestBody;

  try {
    body = (await request.json()) as SearchAssetsRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const storyId = body.storyId?.trim();
  const sceneId = body.sceneId?.trim();
  const sceneIndex = body.sceneIndex;
  const recommendation = body.recommendation;
  const providerResult = body.providerResult;

  if (!storyId || !sceneId || sceneIndex == null || !recommendation || !providerResult) {
    return NextResponse.json(
      { error: "storyId, sceneId, sceneIndex, recommendation, and providerResult are required." },
      { status: 400 },
    );
  }

  if (typeof sceneIndex !== "number" || !Number.isFinite(sceneIndex) || sceneIndex < 0) {
    return NextResponse.json({ error: "sceneIndex must be a non-negative number." }, { status: 400 });
  }

  const page = clampPage(body.page);
  const limit = clampLimit(body.limit);

  const result = await runAssetSearchOrchestrator({
    storyId,
    sceneId,
    sceneIndex,
    query: body.query?.trim() || undefined,
    recommendation,
    providerResult,
    orientation: body.orientation,
    page,
    limit,
    safeSearch: body.safeSearch,
    licensePreference: body.licensePreference,
    semanticSlot: body.semanticSlot?.trim() || undefined,
    metadata: body.visualIntent?.trim()
      ? { handoffVisualIntent: body.visualIntent.trim() }
      : undefined,
  });

  const pagination = estimatePagination(page, limit, result.results.length);

  const response: SearchAssetsResponse = {
    success: result.success,
    query: result.query,
    storyId: result.storyId,
    sceneId: result.sceneId,
    sceneIndex: result.sceneIndex,
    results: result.results,
    page,
    limit,
    totalResults: pagination.totalResults,
    hasNextPage: pagination.hasNextPage,
    error: result.error,
    disabledReason: result.diagnostics.disabledReason,
  };

  return NextResponse.json(response);
}
