"use client";

import { clampSceneImageScale } from "@/features/story/utils";

export interface EditorCanvasZoomBadgeProps {
  scale: number;
  /** Slightly stronger opacity during drag or wheel zoom. */
  emphasized?: boolean;
}

/**
 * Presentation-only zoom level indicator on the canvas edit frame.
 */
export default function EditorCanvasZoomBadge({
  scale,
  emphasized = false,
}: EditorCanvasZoomBadgeProps) {
  const percent = Math.round(clampSceneImageScale(scale) * 100);

  return (
    <div
      aria-live="polite"
      aria-label={`Zoom ${percent} percent`}
      className={`pointer-events-none absolute bottom-3 right-3 z-[7] rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white/90 ring-1 ring-white/10 backdrop-blur-sm transition-opacity duration-150 ${
        emphasized ? "opacity-100" : "opacity-80"
      }`}
    >
      {percent}%
    </div>
  );
}
