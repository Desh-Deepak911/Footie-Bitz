import type { FootieScene, TimelineItem, TransitionEffect, TransitionTimelineItem } from "@/features/story/types";

import { getTransitionsFromTimeline, normalizeTransitionEffect } from "./timeline.utils";

/** Default overlay length when transition metadata omits or zeroes durationMs. */
export const OVERLAY_TRANSITION_FALLBACK_DURATION_MS = 500;

/** Overlay window cannot exceed this fraction of the outgoing scene duration. */
export const OVERLAY_TRANSITION_MAX_SCENE_FRACTION = 0.4;

export interface TransitionProgressInput {
  sceneElapsedMs: number;
  sceneDurationMs: number;
  transitionDurationMs?: number | null;
}

/** Returns the transition item leaving `sceneId` toward the next scene, if any. */
export function getTransitionToNextScene(
  sceneId: string,
  timelineItems: TimelineItem[],
): TransitionTimelineItem | null {
  const match = getTransitionsFromTimeline(timelineItems).find(
    (item) => item.fromSceneId === sceneId,
  );

  return match ?? null;
}

/**
 * Clamps overlay duration: fallback 500ms, capped at 40% of scene duration.
 * Does not modify scene timing — used only for in-scene visual overlay windows.
 */
export function clampOverlayTransitionDurationMs(
  transitionDurationMs: number | null | undefined,
  sceneDurationMs: number,
): number {
  const sceneMs = Math.max(0, sceneDurationMs);
  const requested =
    transitionDurationMs != null && transitionDurationMs > 0
      ? transitionDurationMs
      : OVERLAY_TRANSITION_FALLBACK_DURATION_MS;

  if (sceneMs <= 0) {
    return 0;
  }

  const maxOverlayMs = sceneMs * OVERLAY_TRANSITION_MAX_SCENE_FRACTION;
  return Math.min(requested, maxOverlayMs);
}

/**
 * Overlay progress during the tail of the outgoing scene.
 * Returns 0–1 inside the final overlay window; null outside it.
 */
export function getTransitionProgress({
  sceneElapsedMs,
  sceneDurationMs,
  transitionDurationMs,
}: TransitionProgressInput): number | null {
  const durationMs = Math.max(0, sceneDurationMs);
  const elapsedMs = Math.max(0, sceneElapsedMs);

  if (durationMs <= 0) {
    return null;
  }

  const overlayMs = clampOverlayTransitionDurationMs(transitionDurationMs, durationMs);
  if (overlayMs <= 0) {
    return null;
  }

  const windowStartMs = durationMs - overlayMs;

  if (elapsedMs < windowStartMs || elapsedMs >= durationMs) {
    return null;
  }

  const progress = (elapsedMs - windowStartMs) / overlayMs;
  return Math.min(1, Math.max(0, progress));
}

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
export function resolveSceneTransitionOverlay(
  scenes: FootieScene[],
  timelineItems: TimelineItem[],
  sceneIndex: number,
  sceneElapsedMs: number,
  sceneDurationMs: number,
): SceneTransitionOverlay | null {
  const fromScene = scenes[sceneIndex];
  if (!fromScene) {
    return null;
  }

  const transition = getTransitionToNextScene(fromScene.id, timelineItems);
  if (!transition) {
    return null;
  }

  const progress = getTransitionProgress({
    sceneElapsedMs,
    sceneDurationMs,
    transitionDurationMs: transition.durationMs,
  });

  if (progress === null) {
    return null;
  }

  const toSceneIndex = scenes.findIndex((scene) => scene.id === transition.toSceneId);
  if (toSceneIndex < 0) {
    return null;
  }

  const toScene = scenes[toSceneIndex];
  if (!toScene) {
    return null;
  }

  const effect = normalizeTransitionEffect(transition.effect);

  return {
    fromScene,
    toScene,
    fromSceneIndex: sceneIndex,
    toSceneIndex,
    effect,
    progress: effect === "cut" ? 1 : progress,
  };
}
