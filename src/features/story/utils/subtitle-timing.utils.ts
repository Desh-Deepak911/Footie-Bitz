import type { FootieScene } from "@/features/story/types";

import type { DisplayCaptionScene } from "./caption.utils";
import { getSceneTimingAtGlobalTime } from "./scene.utils";
import {
  getActiveSubtitleChunkStateFromList,
  getSubtitleChunkDurationMs,
  getSubtitleDisplayChunks,
} from "./subtitle.utils";

/** Scene-local clock used to derive subtitle chunk timing (never persisted). */
export interface SubtitleSceneTiming {
  sceneElapsedMs: number;
  sceneDurationMs: number;
}

/** Dynamically derived subtitle state for one frame — no stored timeline. */
export interface ActiveSubtitleTiming {
  activeChunk: string;
  chunkIndex: number;
  chunkCount: number;
  chunkDurationMs: number;
  chunkElapsedMs: number;
  chunkProgress: number;
}

/** Resolves the active subtitle chunk and animation progress from scene timing. */
export function resolveActiveSubtitleTiming(
  chunks: string[],
  timing: SubtitleSceneTiming,
): ActiveSubtitleTiming {
  const chunkCount = chunks.length;
  const state = getActiveSubtitleChunkStateFromList(
    chunks,
    timing.sceneElapsedMs,
    timing.sceneDurationMs,
  );
  const chunkDurationMs = getSubtitleChunkDurationMs(timing.sceneDurationMs, chunkCount);
  const rawIndex =
    chunkCount === 0
      ? 0
      : Math.min(
          chunkCount - 1,
          Math.max(0, Math.floor(Math.max(0, timing.sceneElapsedMs) / chunkDurationMs)),
        );

  return {
    activeChunk: state.chunk,
    chunkIndex: rawIndex,
    chunkCount,
    chunkDurationMs,
    chunkElapsedMs: state.chunkElapsedMs,
    chunkProgress: state.progress,
  };
}

/** Resolves subtitle chunks from scene copy (text only — no timing stored). */
export function resolveSubtitleChunksForScene(scene: DisplayCaptionScene): string[] {
  return getSubtitleDisplayChunks(scene);
}

/** Preview/export path: scene clock → active subtitle chunk. */
export function resolveActiveSubtitleForScene(
  scene: DisplayCaptionScene,
  timing: SubtitleSceneTiming,
): ActiveSubtitleTiming {
  return resolveActiveSubtitleTiming(resolveSubtitleChunksForScene(scene), timing);
}

/**
 * Full playback pipeline:
 * currentTime → currentScene → sceneElapsedMs → activeSubtitleChunk
 */
export function resolveActiveSubtitleAtGlobalTime(
  scenes: FootieScene[],
  scene: DisplayCaptionScene,
  currentTimeMs: number,
): ActiveSubtitleTiming | null {
  const sceneTiming = getSceneTimingAtGlobalTime(scenes, currentTimeMs);
  if (!sceneTiming) {
    return null;
  }

  return resolveActiveSubtitleForScene(scene, {
    sceneElapsedMs: sceneTiming.sceneElapsedMs,
    sceneDurationMs: sceneTiming.sceneDurationMs,
  });
}
