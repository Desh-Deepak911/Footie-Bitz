/** Classifies a manual story edit for evolution tracking. */
export type StoryChangeType =
  | "narration.global"
  | "narration.scene_excerpt"
  | "scene.add"
  | "scene.delete"
  | "scene.duplicate"
  | "scene.reorder"
  | "scene.duration"
  | "scene.type"
  | "scene.caption"
  | "scene.subtitle"
  | "scene.image"
  | "scene.motion"
  | "transition"
  | "project.title"
  | "voiceover.attach"
  | "voiceover.clear";

/** Staleness reason when planning identity falls back to scene index. */
export const SCENE_IDENTITY_MISMATCH_REASON = "scene_identity_mismatch" as const;

export type PlanningStalenessReason = StoryChangeType | typeof SCENE_IDENTITY_MISMATCH_REASON;

/** Scope of downstream systems affected by a story change. */
export type AffectedPlanningScope =
  | "none"
  | "scene"
  | "timing"
  | "timeline"
  | "story"
  | "voiceover_sync";

/** Normalized staleness score in `[0, 1]`. */
export type StalenessScore = number;

/** Future manual refresh guidance — not executed in Phase 2. */
export type RefreshRecommendation = "none" | "scene_refresh" | "full_refresh";

/** A detected manual edit between two script snapshots. */
export interface StoryChangeEvent {
  type: StoryChangeType;
  sceneId?: string;
  sceneIndex?: number;
  transitionId?: string;
  timestamp: string;
}

/** Rule entry describing how a change type affects planning staleness. */
export interface StoryChangeRule {
  type: StoryChangeType;
  planningScopes: readonly AffectedPlanningScope[];
  planningScore: StalenessScore;
  refresh: RefreshRecommendation;
  affectsAssetPlanning: boolean;
  affectsVoiceoverSync: boolean;
}

/** Graph of change-type rules used to compute planning staleness. */
export type StoryChangeGraph = Readonly<Record<StoryChangeType, StoryChangeRule>>;

/** Computed staleness for cached asset planning after manual edits. */
export interface PlanningStaleness {
  isStale: boolean;
  score: StalenessScore;
  reasons: PlanningStalenessReason[];
  affectedScopes: AffectedPlanningScope[];
  voiceoverSyncRequired: boolean;
  staleSince: string;
  lastPlanningHash?: string;
  currentScriptHash?: string;
  /** Present on soft reads when cache metadata differs from the current script. */
  metadataDrift?: {
    sceneCountDrift: boolean;
    hashDrift: boolean;
    storyModeDrift: boolean;
  };
}
