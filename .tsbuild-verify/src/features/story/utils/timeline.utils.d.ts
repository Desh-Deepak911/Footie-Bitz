import type { FootieScene, SceneTimelineItem, SceneType, TimelineItem, TransitionEffect, TransitionTimelineItem } from "@/features/story/types";
/**
 * Recomputes cumulative start/end timing for every scene from each scene's durationMs.
 * Preserves scene order. Falls back to duration (seconds) when durationMs is absent.
 */
export declare function recalculateSceneTimings(scenes: FootieScene[]): FootieScene[];
/** Applies manual duration edit fields before recalculating scene timings. */
export declare function applyManualDurationPatch(durationSec: number): Pick<FootieScene, "duration" | "durationMs" | "durationSource">;
/** Merges manual durationMs/durationSource when a scene duration edit is present. */
export declare function mergeManualDurationUpdates(updates: SceneTimelineUpdates): SceneTimelineUpdates;
/**
 * Returns the sum of all scene durations (ignores start/end, so it stays
 * correct even before timings are recalculated).
 */
export declare function getTotalDuration(scenes: FootieScene[]): number;
/**
 * Resizes scene durations so their sum matches a target total (seconds).
 * Uses proportional weights — defaults to each scene's current duration.
 * Every scene keeps at least 1 second; rounding uses largest-remainder allocation.
 */
export declare function fitScenesToTargetDuration(scenes: FootieScene[], targetDurationSec: number, weights?: number[]): FootieScene[];
/**
 * Allocates milliseconds across scenes by weight (largest-remainder).
 * Sum of returned slots always equals the clamped voiceover total.
 */
export declare function allocateVoiceoverDurationMs(voiceoverDurationMs: number, weights: number[]): number[];
/**
 * Splits voiceover duration evenly across a fixed number of scenes (milliseconds).
 * Remainder milliseconds are distributed one-by-one to the earliest scenes.
 */
export declare function splitVoiceoverDurationEvenlyMs(voiceoverDurationMs: number, sceneCount: number): number[];
/** Applies voiceover timing slots to scenes in milliseconds and derived seconds. */
export declare function attachVoiceoverTimingMs(scenes: FootieScene[], voiceoverDurationMs: number, weights?: number[]): FootieScene[];
/**
 * Redistributes a new voiceover duration across existing scenes proportionally,
 * preserving scene content while updating start/end/duration fields.
 */
export declare function refitScenesToVoiceoverDuration(scenes: FootieScene[], voiceoverDurationMs: number): FootieScene[];
/** Applies even voiceover timing slots to scenes in milliseconds and seconds. */
export declare function attachEvenVoiceoverTiming(scenes: FootieScene[], voiceoverDurationMs: number): FootieScene[];
/**
 * Creates a new blank scene with a unique id and temporary start/end values of 0.
 * Call recalculateSceneTimings on the full list after inserting to get correct timings.
 */
export declare function createEmptyScene(type?: SceneType): FootieScene;
/**
 * Returns a deep copy of a scene with a fresh unique id.
 * Preserves all fields including sceneType and image metadata.
 */
export declare function duplicateScene(scene: FootieScene): FootieScene;
export declare const TRANSITION_EFFECT_OPTIONS: {
    value: TransitionEffect;
    label: string;
}[];
export declare const TRANSITION_DURATION_OPTIONS: readonly [300, 500, 800, 1000];
export type TransitionDurationMs = (typeof TRANSITION_DURATION_OPTIONS)[number];
export declare const TRANSITION_DURATION_LABELS: Record<TransitionDurationMs, string>;
/** User-facing title for transition connector cards in the editor. */
export declare const TRANSITION_CARD_TITLE = "Transition to next scene";
export declare function getTransitionEffectLabel(effect: TransitionEffect | string): string;
export declare function getTransitionDurationLabel(durationMs: number): string;
export declare function normalizeTransitionDurationMs(durationMs: number): TransitionDurationMs;
export declare function normalizeTransitionEffect(effect: string): TransitionEffect;
export type SceneTimelineUpdates = Partial<Pick<FootieScene, "start" | "end" | "duration" | "subtitle" | "sceneType" | "image" | "uploadedImage" | "captionMode" | "subtitleEffect" | "narration" | "subtitleText" | "startMs" | "endMs" | "durationMs" | "durationSource">>;
export type TransitionTimelineUpdates = Partial<Pick<TransitionTimelineItem, "effect" | "durationMs" | "label">>;
/** @deprecated Use TransitionTimelineUpdates */
export type TransitionTimelinePatch = TransitionTimelineUpdates;
/**
 * Interleaves generated scenes with default fade transitions.
 *
 * Example output for three scenes:
 *   scene 1 → transition 1–2 → scene 2 → transition 2–3 → scene 3
 *
 * Pure app-side logic — does not call AI or modify scene content.
 */
export declare function insertDefaultTransitions(scenes: FootieScene[]): TimelineItem[];
/**
 * Ensures every scene has a unique, non-empty id.
 * Legacy stories may omit ids or contain duplicates — both are repaired in place.
 */
export declare function normalizeSceneIds(scenes: FootieScene[]): FootieScene[];
/**
 * Returns a valid timeline for the given scenes.
 * Legacy stories without timelineItems are upgraded via insertDefaultTransitions.
 *
 * Edge cases:
 * - 0 scenes → []
 * - 1 scene → single scene item, no transition
 * - missing timelineItems → built from scenes
 */
export declare function ensureTimelineItems(scenes: FootieScene[], timelineItems?: TimelineItem[] | null): TimelineItem[];
export declare function isSceneTimelineItem(item: TimelineItem): item is SceneTimelineItem;
export declare function isTransitionTimelineItem(item: TimelineItem): item is TransitionTimelineItem;
/** Returns scene items from the timeline in playback order. */
export declare function getScenesFromTimeline(timelineItems: TimelineItem[]): FootieScene[];
/** Returns all transition items from the timeline. */
export declare function getTransitionsFromTimeline(timelineItems: TimelineItem[]): TransitionTimelineItem[];
/** Looks up a scene embedded in the timeline by id. */
export declare function getSceneFromTimeline(timelineItems: TimelineItem[], sceneId: string): FootieScene | undefined;
/** Patches a single scene item embedded in the timeline. */
export declare function updateSceneInTimeline(timelineItems: TimelineItem[], sceneId: string, updates: SceneTimelineUpdates): TimelineItem[];
/** Patches effect, duration, or label on a single transition item. */
export declare function updateTransitionInTimeline(timelineItems: TimelineItem[], transitionId: string, updates: TransitionTimelineUpdates): TimelineItem[];
/** Updates a scene in the canonical scenes array by id. */
export declare function updateSceneInScenes(scenes: FootieScene[], sceneId: string, updates: SceneTimelineUpdates): FootieScene[];
/** Returns true when scene content/order is unchanged (transition-only edits). */
export declare function scenesStructurallyEqual(a: FootieScene[], b: FootieScene[]): boolean;
/** Refreshes embedded scene refs on timeline scene items without rebuilding transitions. */
export declare function syncTimelineSceneRefs(scenes: FootieScene[], timelineItems: TimelineItem[]): TimelineItem[];
/**
 * Rebuilds timeline items from the current scene list, preserving transition
 * settings (effect, duration, label) when the same scene pair still exists.
 */
export declare function syncTimelineItemsWithScenes(scenes: FootieScene[], previous?: TimelineItem[]): TimelineItem[];
//# sourceMappingURL=timeline.utils.d.ts.map