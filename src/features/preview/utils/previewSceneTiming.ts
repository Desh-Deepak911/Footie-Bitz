import { getSceneTimingAtGlobalTime, getSceneTimingMap } from "@/features/story/utils";
import type { FootieScene } from "@/features/story/types";

export interface PreviewSceneTimingInput {
  scenes: FootieScene[];
  sceneIndex: number;
  elapsedSec: number;
  playbackMode: "browser" | "narration" | null;
  isPlaying: boolean;
  browserSceneStartedAtMs: number | null;
  previewClockMs: number;
}

export interface PreviewSceneTiming {
  sceneElapsedMs: number;
  sceneDurationMs: number;
  /** Active scene index derived from global playback time (narration mode). */
  activeSceneIndex?: number;
}

/** Derives scene-local preview timing from playback clocks and the timing map. */
export function getPreviewSceneTiming({
  scenes,
  sceneIndex,
  elapsedSec,
  playbackMode,
  isPlaying,
  browserSceneStartedAtMs,
  previewClockMs,
}: PreviewSceneTimingInput): PreviewSceneTiming {
  if (playbackMode === "narration") {
    const timingAt = getSceneTimingAtGlobalTime(scenes, elapsedSec * 1000);
    if (timingAt) {
      return {
        sceneElapsedMs: timingAt.sceneElapsedMs,
        sceneDurationMs: timingAt.sceneDurationMs,
        activeSceneIndex: timingAt.slot.index,
      };
    }
  }

  const slot = getSceneTimingMap(scenes)[sceneIndex];
  const sceneDurationMs = slot?.durationMs ?? 1000;
  let sceneElapsedMs = 0;

  if (isPlaying && playbackMode === "browser" && browserSceneStartedAtMs !== null) {
    sceneElapsedMs = Math.min(sceneDurationMs, previewClockMs - browserSceneStartedAtMs);
  }

  return { sceneElapsedMs, sceneDurationMs };
}
