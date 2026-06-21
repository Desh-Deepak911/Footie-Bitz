import type { ExportScene } from "@/features/export/services/export-payload.service";
import type { SubtitleEffect } from "@/features/story/types";
import {
  getActiveSubtitleChunkFromList,
  getSubtitleDisplayChunks,
  getSubtitleChunkDurationMs,
  normalizeCaptionMode,
  normalizeSubtitleEffect,
  resolveActiveSubtitleTiming,
  SUBTITLE_MAX_VISIBLE_LINES,
  type DisplayCaptionTiming,
  wrapSubtitleTextToDisplayLines,
} from "@/features/story/utils";
import {
  getExportSubtitleEffectProgress,
  getTypewriterRevealedText,
} from "@/features/story/utils/subtitle-effect.utils";

/** @deprecated Use SUBTITLE_MAX_VISIBLE_LINES */
export const EXPORT_SUBTITLE_MAX_VISIBLE_LINES = SUBTITLE_MAX_VISIBLE_LINES;

type ExportSubtitleScene = Pick<
  ExportScene,
  | "captionMode"
  | "subtitleEffect"
  | "subtitleChunks"
  | "subtitleText"
  | "narration"
  | "subtitle"
>;

export interface ExportSubtitleChunkState {
  chunk: string;
  progress: number;
  chunkElapsedMs: number;
  activeChunkDurationMs: number;
  effectProgress: number;
}

function resolveExportSubtitleChunks(scene: ExportSubtitleScene): string[] {
  if (scene.subtitleChunks && scene.subtitleChunks.length > 0) {
    return scene.subtitleChunks;
  }

  return getSubtitleDisplayChunks(scene);
}

export function getExportActiveChunkDurationMs(
  sceneDurationMs: number,
  chunkCount: number,
): number {
  return getSubtitleChunkDurationMs(sceneDurationMs, chunkCount);
}

/** Returns the single timed subtitle chunk visible at this export frame. */
export function getExportActiveSubtitleChunk(
  scene: ExportSubtitleScene,
  timing: DisplayCaptionTiming,
): string {
  if (normalizeCaptionMode(scene.captionMode) !== "subtitles") {
    return "";
  }

  const chunks = resolveExportSubtitleChunks(scene);
  if (chunks.length === 0) {
    return "";
  }

  return getActiveSubtitleChunkFromList(
    chunks,
    timing.sceneElapsedMs,
    timing.sceneDurationMs,
  );
}

/** Active chunk timing state for export frame rendering. */
export function getExportSubtitleChunkState(
  scene: ExportSubtitleScene,
  timing: DisplayCaptionTiming,
): ExportSubtitleChunkState {
  const chunks = resolveExportSubtitleChunks(scene);
  const state = resolveActiveSubtitleTiming(chunks, timing);
  const activeChunkDurationMs = state.chunkDurationMs;
  const effectProgress = getExportSubtitleEffectProgress(
    state.chunkElapsedMs,
    activeChunkDurationMs,
  );

  return {
    chunk: state.activeChunk,
    progress: state.chunkProgress,
    chunkElapsedMs: state.chunkElapsedMs,
    activeChunkDurationMs,
    effectProgress,
  };
}

export interface ExportSubtitleDisplay {
  /** The one timed chunk selected for this frame. */
  activeChunk: string;
  /** Word-wrap rows derived from the active chunk (typewriter uses progressive reveal). */
  lines: string[];
  effect: SubtitleEffect;
  sceneElapsedMs: number;
  chunkElapsedMs: number;
  activeChunkDurationMs: number;
  effectProgress: number;
}

/**
 * Resolves export subtitle display for one frame — exactly one timed chunk,
 * never the full subtitle array or adjacent chunks.
 */
export function resolveExportSubtitleDisplay(
  scene: ExportSubtitleScene,
  timing: DisplayCaptionTiming,
): ExportSubtitleDisplay | null {
  if (normalizeCaptionMode(scene.captionMode) !== "subtitles") {
    return null;
  }

  const state = getExportSubtitleChunkState(scene, timing);
  const activeChunk = state.chunk.trim();
  if (!activeChunk) {
    return null;
  }

  const effect = normalizeSubtitleEffect(scene.subtitleEffect);

  if (effect === "typewriter") {
    const revealed = getTypewriterRevealedText(activeChunk, state.effectProgress).trim();
    if (!revealed) {
      return null;
    }

    return {
      activeChunk,
      lines: [revealed],
      effect,
      sceneElapsedMs: timing.sceneElapsedMs,
      chunkElapsedMs: state.chunkElapsedMs,
      activeChunkDurationMs: state.activeChunkDurationMs,
      effectProgress: state.effectProgress,
    };
  }

  const lines = wrapSubtitleTextToDisplayLines(activeChunk, {
    maxLines: SUBTITLE_MAX_VISIBLE_LINES,
  });

  if (lines.length === 0) {
    return null;
  }

  return {
    activeChunk,
    lines,
    effect,
    sceneElapsedMs: timing.sceneElapsedMs,
    chunkElapsedMs: state.chunkElapsedMs,
    activeChunkDurationMs: state.activeChunkDurationMs,
    effectProgress: state.effectProgress,
  };
}
