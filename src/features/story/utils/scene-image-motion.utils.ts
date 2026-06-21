import type { SceneImageMotion, SceneImageMotionIntensity } from "@/features/story/types";

import { normalizeSceneImageMotion } from "./scene.utils";

/** Peak scale multiplier at the end of zoom-in / start of zoom-out by intensity. */
export const SCENE_IMAGE_MOTION_INTENSITY_MAX_SCALE: Record<
  SceneImageMotionIntensity,
  number
> = {
  subtle: 1.05,
  medium: 1.1,
  strong: 1.16,
};

/** Scene-local progress for image motion (0 at scene start, 1 at scene end). */
export function resolveSceneImageMotionProgress(
  sceneElapsedMs: number,
  sceneDurationMs: number,
): number {
  if (sceneDurationMs <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, sceneElapsedMs / sceneDurationMs));
}

/** Additional scale multiplier applied on top of manual pan/zoom during playback. */
export function resolveSceneImageMotionScale(
  motion: SceneImageMotion | undefined,
  progress: number,
): number {
  const normalized = normalizeSceneImageMotion(motion);
  if (normalized.type === "none") {
    return 1;
  }

  const peakScale = SCENE_IMAGE_MOTION_INTENSITY_MAX_SCALE[normalized.intensity];
  const clampedProgress = Math.min(1, Math.max(0, progress));

  if (normalized.type === "zoom-in") {
    return 1 + (peakScale - 1) * clampedProgress;
  }

  return peakScale - (peakScale - 1) * clampedProgress;
}
