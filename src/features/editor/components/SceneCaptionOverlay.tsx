"use client";

import { normalizeCaptionMode } from "@/features/story/utils";
import { getDisplayCaption, type DisplayCaptionScene } from "@/features/story/utils";
import { studioStoryboardCaptionOverlay } from "@/lib/studioUi";

import { renderSceneCaptionContent } from "@/features/editor/components/subtitleEffectPreview";

interface SceneCaptionOverlayProps {
  scene: DisplayCaptionScene & { id?: string };
  className?: string;
}

/** On-screen caption overlay for storyboard scene card media preview. */
export default function SceneCaptionOverlay({
  scene,
  className = "",
}: SceneCaptionOverlayProps) {
  const isSubtitlesMode = normalizeCaptionMode(scene.captionMode) === "subtitles";
  const visibleCaption = getDisplayCaption(scene);

  const caption = renderSceneCaptionContent(
    scene,
    studioStoryboardCaptionOverlay,
    `${scene.id ?? "card"}-${visibleCaption}`,
    isSubtitlesMode ? { activeSubtitleChunk: visibleCaption } : {},
  );

  if (!caption) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4 ${className}`}
      aria-hidden
    >
      {caption}
    </div>
  );
}
