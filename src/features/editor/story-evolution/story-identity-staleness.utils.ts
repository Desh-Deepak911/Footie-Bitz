import type {
  AffectedPlanningScope,
  PlanningStaleness,
  PlanningStalenessReason,
  StalenessScore,
} from "./story-evolution.types";
import { SCENE_IDENTITY_MISMATCH_REASON } from "./story-evolution.types";

export { SCENE_IDENTITY_MISMATCH_REASON };

const IDENTITY_MISMATCH_SCORE: StalenessScore = 0.6;

function mergeScopes(scopes: readonly AffectedPlanningScope[]): AffectedPlanningScope[] {
  return [...new Set(scopes.filter((scope) => scope !== "none"))];
}

/** Merges scene identity mismatch into existing planning staleness metadata. */
export function mergeIdentityMismatchStaleness(
  existing: PlanningStaleness | undefined,
  hasIndexFallback: boolean,
): PlanningStaleness {
  const staleSince = existing?.staleSince ?? new Date().toISOString();

  if (!hasIndexFallback) {
    return (
      existing ?? {
        isStale: false,
        score: 0,
        reasons: [],
        affectedScopes: [],
        voiceoverSyncRequired: false,
        staleSince,
      }
    );
  }

  const reasons: PlanningStalenessReason[] = existing?.reasons
    ? [...existing.reasons]
    : [];

  if (!reasons.includes(SCENE_IDENTITY_MISMATCH_REASON)) {
    reasons.push(SCENE_IDENTITY_MISMATCH_REASON);
  }

  return {
    isStale: true,
    score: Math.max(existing?.score ?? 0, IDENTITY_MISMATCH_SCORE),
    reasons,
    affectedScopes: mergeScopes([...(existing?.affectedScopes ?? []), "timeline"]),
    voiceoverSyncRequired: existing?.voiceoverSyncRequired ?? false,
    staleSince,
    lastPlanningHash: existing?.lastPlanningHash,
    currentScriptHash: existing?.currentScriptHash,
  };
}
