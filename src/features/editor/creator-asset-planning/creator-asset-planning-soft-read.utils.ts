import type { CreatorAssetPlanningCacheEntry } from "./creator-asset-planning.types";
import type { CreatorAssetStudioPlanningData } from "./creator-asset-planning.types";
import { mergeIdentityMismatchStaleness } from "@/features/editor/story-evolution/story-identity-staleness.utils";
import type {
  AffectedPlanningScope,
  PlanningStaleness,
  PlanningStalenessReason,
} from "@/features/editor/story-evolution/story-evolution.types";
import { SCENE_IDENTITY_MISMATCH_REASON } from "@/features/editor/story-evolution/story-evolution.types";

export type PlanningReadMode = "strict" | "soft";

export interface ReadPlanningDataMetadata {
  scriptHash: string;
  sceneCount: number;
  storyMode: string;
}

export interface ReadPlanningDataOptions {
  mode?: PlanningReadMode;
}

export function resolveMetadataDriftFlags(
  entry: CreatorAssetPlanningCacheEntry,
  metadata: ReadPlanningDataMetadata,
): {
  sceneCountDrift: boolean;
  hashDrift: boolean;
  storyModeDrift: boolean;
} {
  return {
    sceneCountDrift: entry.sceneCount !== metadata.sceneCount,
    hashDrift: entry.scriptHash !== metadata.scriptHash,
    storyModeDrift: entry.storyMode !== metadata.storyMode,
  };
}

function metadataMatches(
  entry: CreatorAssetPlanningCacheEntry,
  metadata: ReadPlanningDataMetadata,
): boolean {
  return (
    entry.scriptHash === metadata.scriptHash &&
    entry.sceneCount === metadata.sceneCount &&
    entry.storyMode === metadata.storyMode
  );
}

function mergeReasons(
  existing: readonly PlanningStalenessReason[] | undefined,
): PlanningStalenessReason[] {
  return existing ? [...existing] : [];
}

function mergeScopes(
  existing: readonly AffectedPlanningScope[] | undefined,
): AffectedPlanningScope[] {
  return existing ? [...existing] : [];
}

/** Builds staleness when cache metadata no longer matches the current script. */
export function buildMetadataDriftStaleness(
  entry: CreatorAssetPlanningCacheEntry,
  metadata: ReadPlanningDataMetadata,
): PlanningStaleness {
  const existing = entry.staleness;
  const metadataDrift = resolveMetadataDriftFlags(entry, metadata);
  let score = existing?.score ?? 0;
  const reasons = mergeReasons(existing?.reasons);
  const affectedScopes = new Set<AffectedPlanningScope>(mergeScopes(existing?.affectedScopes));

  if (metadataDrift.sceneCountDrift) {
    score = Math.max(score, 1.0);
    affectedScopes.add("story");
  }

  if (metadataDrift.hashDrift) {
    score = metadataDrift.sceneCountDrift ? Math.max(score, 1.0) : Math.max(score, 0.5);
    affectedScopes.add("story");
    if (!metadataDrift.sceneCountDrift) {
      affectedScopes.add("timing");
    }
  }

  if (metadataDrift.storyModeDrift) {
    score = Math.max(score, 0.2);
    affectedScopes.add("story");
  }

  return {
    isStale: true,
    score,
    reasons,
    affectedScopes: [...affectedScopes],
    voiceoverSyncRequired: existing?.voiceoverSyncRequired ?? false,
    staleSince: existing?.staleSince ?? new Date().toISOString(),
    lastPlanningHash: entry.scriptHash,
    currentScriptHash: metadata.scriptHash,
    metadataDrift,
  };
}

/** Merges entry staleness with metadata drift for soft-read responses. */
export function mergeSoftReadStaleness(
  entry: CreatorAssetPlanningCacheEntry,
  metadata: ReadPlanningDataMetadata,
): PlanningStaleness {
  if (metadataMatches(entry, metadata)) {
    return (
      entry.staleness ?? {
        isStale: false,
        score: 0,
        reasons: [],
        affectedScopes: [],
        voiceoverSyncRequired: false,
        staleSince: entry.generatedAt,
        lastPlanningHash: entry.scriptHash,
        currentScriptHash: metadata.scriptHash,
      }
    );
  }

  let staleness = buildMetadataDriftStaleness(entry, metadata);

  if (entry.staleness?.isStale) {
    staleness = {
      ...staleness,
      score: Math.max(staleness.score, entry.staleness.score),
      reasons: [...new Set([...staleness.reasons, ...entry.staleness.reasons])],
      affectedScopes: [
        ...new Set([...staleness.affectedScopes, ...entry.staleness.affectedScopes]),
      ],
      voiceoverSyncRequired:
        staleness.voiceoverSyncRequired || entry.staleness.voiceoverSyncRequired,
      staleSince: entry.staleness.staleSince,
      metadataDrift: staleness.metadataDrift,
    };
  }

  if (staleness.reasons.includes(SCENE_IDENTITY_MISMATCH_REASON)) {
    staleness = mergeIdentityMismatchStaleness(staleness, true);
    staleness.metadataDrift = resolveMetadataDriftFlags(entry, metadata);
  }

  return staleness;
}

/** Attaches resolved staleness to planning output for soft reads. */
export function attachPlanningStaleness(
  planning: CreatorAssetStudioPlanningData,
  staleness: PlanningStaleness | undefined,
): CreatorAssetStudioPlanningData {
  if (!staleness?.isStale) {
    return planning;
  }

  return {
    ...planning,
    staleness,
  };
}
