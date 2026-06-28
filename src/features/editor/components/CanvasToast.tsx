"use client";

import { clampSceneImageScale } from "@/features/story/utils";

function formatPanAxis(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export interface CanvasToastProps {
  scale: number;
  panX: number;
  panY: number;
  interactionActive: boolean;
}

/**
 * Live zoom/pan feedback during canvas editing.
 * Presentation-only — never captures pointer events.
 */
export default function CanvasToast({
  scale,
  panX,
  panY,
  interactionActive,
}: CanvasToastProps) {
  const zoomPercent = Math.round(clampSceneImageScale(scale) * 100);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`pointer-events-none absolute bottom-3 right-3 z-[7] rounded-xl bg-black/55 px-2.5 py-2 ring-1 ring-white/10 backdrop-blur-sm transition-opacity duration-500 ${
        interactionActive ? "opacity-100" : "opacity-0"
      }`}
    >
      <dl className="space-y-0.5 text-[10px] leading-none text-white/90">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-medium text-white/55">Zoom</dt>
          <dd className="font-medium tabular-nums">{zoomPercent}%</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-medium text-white/55">Pan</dt>
          <dd className="font-medium tabular-nums">
            X {formatPanAxis(panX)} · Y {formatPanAxis(panY)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
