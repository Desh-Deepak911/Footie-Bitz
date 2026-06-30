import {
  readPlanningCache,
} from "@/features/editor/creator-asset-planning/creator-asset-planning.cache";
import { isAssetIntelligencePlanningEnabled } from "@/features/editor/creator-asset-planning/creator-asset-planning-generation.utils";
import type {
  CreatorAssetPlanningSnapshot,
} from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import { hydrateCreatorAssetPlanningCache } from "@/features/editor/creator-asset-planning/creator-asset-planning.utils";

import type { Draft } from "../types";

/** Max JSON payload size for persisted planning snapshots — skips save when exceeded. */
export const DRAFT_ASSET_PLANNING_SNAPSHOT_MAX_BYTES = 512 * 1024;

function warnDraftPlanningPersistence(message: string, details?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (details) {
    console.warn(`draft-asset-planning-persistence: ${message}`, details);
    return;
  }

  console.warn(`draft-asset-planning-persistence: ${message}`);
}

/** Returns whether draft planning snapshots should be persisted or rehydrated. */
export function isDraftAssetPlanningPersistenceEnabled(): boolean {
  return isAssetIntelligencePlanningEnabled();
}

/** Measures UTF-8 byte length of a JSON-serializable value. */
export function measureDraftPlanningSnapshotBytes(snapshot: CreatorAssetPlanningSnapshot): number {
  return Buffer.byteLength(JSON.stringify(snapshot), "utf8");
}

/** Builds a JSON-safe planning snapshot from the in-memory cache. */
export function buildPersistableAssetPlanningSnapshot(
  draftId: string,
): CreatorAssetPlanningSnapshot | undefined {
  if (!isDraftAssetPlanningPersistenceEnabled()) {
    return undefined;
  }

  const entry = readPlanningCache(draftId);
  if (!entry) {
    return undefined;
  }

  const snapshot: CreatorAssetPlanningSnapshot = {
    planningVersion: entry.planningVersion,
    generatedAt: entry.generatedAt,
    scriptHash: entry.scriptHash,
    sceneCount: entry.sceneCount,
    storyMode: entry.storyMode,
    planning: {
      recommendation: entry.planning.recommendation,
      providerPlan: entry.planning.providerPlan,
      validationResult: entry.planning.validationResult,
      ...(entry.planning.staleness ? { staleness: entry.planning.staleness } : {}),
    },
    ...(entry.staleness ? { staleness: entry.staleness } : {}),
  };

  return JSON.parse(JSON.stringify(snapshot)) as CreatorAssetPlanningSnapshot;
}

/**
 * Resolves a planning snapshot for draft persistence.
 * Returns undefined when disabled, missing, non-serializable, or oversized.
 */
export function resolveAssetPlanningSnapshotForDraftPersist(
  draftId: string,
): CreatorAssetPlanningSnapshot | undefined {
  if (!isDraftAssetPlanningPersistenceEnabled()) {
    return undefined;
  }

  let snapshot: CreatorAssetPlanningSnapshot | undefined;
  try {
    snapshot = buildPersistableAssetPlanningSnapshot(draftId);
  } catch {
    warnDraftPlanningPersistence("failed to serialize planning snapshot", { draftId });
    return undefined;
  }

  if (!snapshot) {
    return undefined;
  }

  try {
    const bytes = measureDraftPlanningSnapshotBytes(snapshot);
    if (bytes > DRAFT_ASSET_PLANNING_SNAPSHOT_MAX_BYTES) {
      warnDraftPlanningPersistence("planning snapshot too large — skipping persistence", {
        draftId,
        bytes,
        maxBytes: DRAFT_ASSET_PLANNING_SNAPSHOT_MAX_BYTES,
      });
      return undefined;
    }
  } catch {
    warnDraftPlanningPersistence("failed to measure planning snapshot size", { draftId });
    return undefined;
  }

  return snapshot;
}

/** Rehydrates the in-memory planning cache from a persisted draft snapshot. */
export function rehydrateAssetPlanningCacheFromDraft(draft: Draft): void {
  if (!isDraftAssetPlanningPersistenceEnabled()) {
    return;
  }

  const snapshot = draft.assetPlanningSnapshot;
  if (!snapshot) {
    return;
  }

  hydrateCreatorAssetPlanningCache(draft.id, snapshot);
}
