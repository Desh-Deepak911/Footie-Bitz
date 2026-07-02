import "server-only";

import { NextResponse } from "next/server";

import {
  materializeAssetImage,
  type AssetMaterializationPreferredResolution,
  type AssetMaterializationRequest,
  type AssetMaterializationResult,
} from "@/features/asset-materialization";
import type { AssetSearchProviderId } from "@/features/asset-search/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface MaterializeAssetRequestBody {
  providerId?: AssetSearchProviderId;
  previewUrl?: string;
  fullResolutionUrl?: string;
  preferredResolution?: AssetMaterializationPreferredResolution;
  mimeType?: string;
}

export type MaterializeAssetResponse = AssetMaterializationResult;

const ASSET_SEARCH_PROVIDER_IDS: readonly AssetSearchProviderId[] = [
  "manual",
  "pexels",
  "unsplash",
  "pixabay",
  "wikimedia",
  "internal_library",
  "ai_generated",
  "mock",
];

function isAssetSearchProviderId(value: string): value is AssetSearchProviderId {
  return (ASSET_SEARCH_PROVIDER_IDS as readonly string[]).includes(value);
}

function isPreferredResolution(
  value: unknown,
): value is AssetMaterializationPreferredResolution {
  return value === "preview" || value === "full";
}

export async function POST(request: Request) {
  let body: MaterializeAssetRequestBody;

  try {
    body = (await request.json()) as MaterializeAssetRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawProviderId = typeof body.providerId === "string" ? body.providerId.trim() : "";
  const previewUrl = body.previewUrl?.trim() ?? "";
  const fullResolutionUrl = body.fullResolutionUrl?.trim() ?? "";

  if (!rawProviderId) {
    return NextResponse.json({ error: "providerId is required." }, { status: 400 });
  }

  if (!isAssetSearchProviderId(rawProviderId)) {
    return NextResponse.json({ error: "providerId is invalid." }, { status: 400 });
  }

  const providerId = rawProviderId;

  if (!previewUrl && !fullResolutionUrl) {
    return NextResponse.json(
      { error: "previewUrl or fullResolutionUrl is required." },
      { status: 400 },
    );
  }

  if (body.preferredResolution != null && !isPreferredResolution(body.preferredResolution)) {
    return NextResponse.json(
      { error: "preferredResolution must be preview or full." },
      { status: 400 },
    );
  }

  const materializationRequest: AssetMaterializationRequest = {
    providerId,
    previewUrl,
    fullResolutionUrl,
    preferredResolution: body.preferredResolution,
    mimeType: body.mimeType?.trim() || undefined,
  };

  const result = await materializeAssetImage(materializationRequest);
  const status = result.success ? 200 : 422;

  return NextResponse.json(result satisfies MaterializeAssetResponse, { status });
}
