import type { CreatorAssetStudioPlanningData } from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import type { FootieScript } from "@/features/story/types";
import type { ScriptMode } from "@/types/footiebitz";

/** Why a planning refresh was requested. */
export type CreatorAssetPlanningRefreshReason =
  | "manual"
  | "stale_planning"
  | "metadata_drift"
  | "scene_edit"
  | "story_edit"
  | "timeline_edit"
  | "unknown";

/** Scope requested for a planning refresh — v1 executes full refresh for all scopes. */
export type CreatorAssetPlanningRefreshScope = "full" | "scene" | "timeline" | "story";

/** Input for refreshing cached Creator Asset Studio planning. */
export interface CreatorAssetPlanningRefreshInput {
  storyId: string;
  script: FootieScript;
  storyMode?: ScriptMode;
  /** Generation topic — defaults to `script.title`. */
  topic?: string;
  scope: CreatorAssetPlanningRefreshScope;
  reason?: CreatorAssetPlanningRefreshReason;
  /** Target scene when `scope` is `scene`. */
  sceneIndex?: number;
  sceneId?: string;
}

/** Diagnostics recorded for every refresh attempt. */
export interface CreatorAssetPlanningRefreshDiagnostics {
  storyId: string;
  requestedScope: CreatorAssetPlanningRefreshScope;
  /** v1 always performs a full cache rebuild regardless of requested scope. */
  effectiveScope: CreatorAssetPlanningRefreshScope;
  reason?: CreatorAssetPlanningRefreshReason;
  sceneIndex?: number;
  sceneId?: string;
  refreshedAt: string;
  durationMs: number;
  sceneCount: number;
  storyMode: ScriptMode;
  previousScriptHash?: string;
  newScriptHash?: string;
  hadPreviousCache: boolean;
  cacheReplaced: boolean;
}

/** Result of a planning refresh attempt. */
export interface CreatorAssetPlanningRefreshResult {
  success: boolean;
  planning?: CreatorAssetStudioPlanningData;
  diagnostics: CreatorAssetPlanningRefreshDiagnostics;
  error?: string;
}
