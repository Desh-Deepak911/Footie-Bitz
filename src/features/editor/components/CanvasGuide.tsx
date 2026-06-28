"use client";

import type { CanvasGuideKind } from "@/features/editor/utils/resolveCanvasGuides.utils";

const GUIDE_LINE = "absolute bg-white/35";

export interface CanvasGuideProps {
  kind: CanvasGuideKind;
  visible: boolean;
}

/**
 * Single visual guide overlay (lines / frame accents).
 */
export default function CanvasGuide({ kind, visible }: CanvasGuideProps) {
  const opacityClass = visible ? "opacity-100" : "opacity-0";

  switch (kind) {
    case "centered":
    case "resetPosition":
      return (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[3] transition-opacity duration-300 ${opacityClass}`}
        >
          <div className={`${GUIDE_LINE} left-1/2 top-[12%] h-[76%] w-px -translate-x-1/2`} />
          <div className={`${GUIDE_LINE} left-[12%] top-1/2 h-px w-[76%] -translate-y-1/2`} />
          {kind === "resetPosition" ? (
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/80 ring-2 ring-white/30" />
          ) : null}
        </div>
      );

    case "topAligned":
      return (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-[8%] top-[12%] z-[3] transition-opacity duration-300 ${opacityClass}`}
        >
          <div className={`${GUIDE_LINE} inset-x-0 top-0 h-px`} />
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
      );

    case "bottomAligned":
      return (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-[8%] bottom-[12%] z-[3] transition-opacity duration-300 ${opacityClass}`}
        >
          <div className={`${GUIDE_LINE} inset-x-0 bottom-0 h-px`} />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/10 to-transparent" />
        </div>
      );

    case "edgeLeft":
      return (
        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-[12%] left-[8%] top-[12%] z-[3] transition-opacity duration-300 ${opacityClass}`}
        >
          <div className={`${GUIDE_LINE} inset-y-0 left-0 w-px`} />
        </div>
      );

    case "edgeRight":
      return (
        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-[12%] right-[8%] top-[12%] z-[3] transition-opacity duration-300 ${opacityClass}`}
        >
          <div className={`${GUIDE_LINE} inset-y-0 right-0 w-px`} />
        </div>
      );

    case "frameFilled":
      return (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-[6%] z-[3] rounded-lg ring-1 ring-accent/50 transition-opacity duration-300 ${opacityClass}`}
        />
      );

    default:
      return null;
  }
}
