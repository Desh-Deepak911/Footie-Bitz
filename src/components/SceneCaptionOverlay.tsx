"use client";

import { type DisplayCaptionScene } from "@/lib/displayCaption";
import {
  studioPreviewCaption,
  studioStoryboardCaptionOverlay,
} from "@/lib/studioUi";

import { renderSceneCaptionContent } from "@/components/subtitleEffectPreview";

interface SceneCaptionOverlayProps {
  scene: DisplayCaptionScene & { id?: string };
  /** `preview` — phone preview; `card` — storyboard scene card */
  variant?: "preview" | "card";
  /** `overlay` — absolute bottom on media; `inline` — flows in parent layout */
  layout?: "overlay" | "inline";
  className?: string;
}

export default function SceneCaptionOverlay({
  scene,
  variant = "preview",
  layout = "overlay",
  className = "",
}: SceneCaptionOverlayProps) {
  const styleClass =
    variant === "card" ? studioStoryboardCaptionOverlay : studioPreviewCaption;

  const caption = renderSceneCaptionContent(scene, styleClass, scene.id ?? variant);

  if (!caption) {
    return null;
  }

  if (layout === "inline") {
    return (
      <div className={className} aria-hidden>
        {caption}
      </div>
    );
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
