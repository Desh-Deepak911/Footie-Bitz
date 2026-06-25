import type { FootieScene, TimelineItem, TransitionEffect, TransitionTimelineItem } from "@/features/story/types";
/** Default overlay length when transition metadata omits or zeroes durationMs. */
export declare const OVERLAY_TRANSITION_FALLBACK_DURATION_MS = 500;
/** Overlay window cannot exceed this fraction of the outgoing scene duration. */
export declare const OVERLAY_TRANSITION_MAX_SCENE_FRACTION = 0.4;
export interface TransitionProgressInput {
    sceneElapsedMs: number;
    sceneDurationMs: number;
    transitionDurationMs?: number | null;
}
/** Returns the transition item leaving `sceneId` toward the next scene, if any. */
export declare function getTransitionToNextScene(sceneId: string, timelineItems: TimelineItem[]): TransitionTimelineItem | null;
/**
 * Clamps overlay duration: fallback 500ms, capped at 40% of scene duration.
 * Does not modify scene timing — used only for in-scene visual overlay windows.
 */
export declare function clampOverlayTransitionDurationMs(transitionDurationMs: number | null | undefined, sceneDurationMs: number): number;
/**
 * Overlay progress during the tail of the outgoing scene.
 * Returns 0–1 inside the final overlay window; null outside it.
 */
export declare function getTransitionProgress({ sceneElapsedMs, sceneDurationMs, transitionDurationMs, }: TransitionProgressInput): number | null;
/** Active in-scene transition overlay — visual only, no timeline extension. */
export interface SceneTransitionOverlay {
    fromScene: FootieScene;
    toScene: FootieScene;
    fromSceneIndex: number;
    toSceneIndex: number;
    effect: TransitionEffect;
    progress: number;
}
/**
 * Resolves tail-of-scene overlay state from scene-local timing.
 * Returns null outside the outgoing scene's final transition window.
 */
export declare function resolveSceneTransitionOverlay(scenes: FootieScene[], timelineItems: TimelineItem[], sceneIndex: number, sceneElapsedMs: number, sceneDurationMs: number): SceneTransitionOverlay | null;
//# sourceMappingURL=transition-overlay.utils.d.ts.map