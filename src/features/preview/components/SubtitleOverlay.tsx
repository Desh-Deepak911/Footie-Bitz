"use client";

import type { CaptionAnimationState } from "@/features/timeline-intelligence/resolve-caption-animation-state.utils";
import { isTransitionVideoContent, resolveActiveSubtitleForScene } from "@/features/story/utils";
import { type DisplayCaptionScene } from "@/features/story/utils";

import { renderSceneCaptionContent } from "@/features/editor/components/subtitleEffectPreview";

interface SubtitleOverlayProps {
  scene: DisplayCaptionScene & { id?: string };
  sceneElapsedMs: number;
  sceneDurationMs: number;
  activeSubtitleChunk?: string;
  chunkProgress?: number;
  captionAnimationState?: CaptionAnimationState | null;
  subtitleAvailableDurationMs?: number;
  className?: string;
}

/** Timed narration subtitles inside the phone preview frame. */
export default function SubtitleOverlay({
  scene,
  sceneElapsedMs,
  sceneDurationMs,
  activeSubtitleChunk,
  chunkProgress,
  captionAnimationState,
  subtitleAvailableDurationMs,
  className = "",
}: SubtitleOverlayProps) {
  const previewChunkState =
    activeSubtitleChunk != null
      ? {
          activeChunk: activeSubtitleChunk,
          chunkProgress: chunkProgress ?? 0,
        }
      : resolveActiveSubtitleForScene(scene, {
          sceneElapsedMs,
          sceneDurationMs,
        });
  const visibleCaption = isTransitionVideoContent(previewChunkState.activeChunk)
    ? ""
    : previewChunkState.activeChunk;

  const caption = renderSceneCaptionContent(
    scene,
    "preview-narration-subtitle-text",
    `${scene.id ?? "preview"}-${visibleCaption}`,
    {
      maxLines: 3,
      activeSubtitleChunk: visibleCaption,
      captionAnimationState: captionAnimationState ?? undefined,
      subtitleAvailableDurationMs,
    },
  );

  if (!caption) {
    return null;
  }

  return (
    <div className={`preview-narration-subtitle-overlay ${className}`.trim()} aria-hidden>
      <div className="preview-narration-subtitle-pill">{caption}</div>
    </div>
  );
}
