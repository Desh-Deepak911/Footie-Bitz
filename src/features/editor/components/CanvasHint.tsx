"use client";

const HINTS = [
  "Drag to reposition",
  "Scroll to zoom",
  "Double-click to reset",
] as const;

export interface CanvasHintProps {
  visible: boolean;
}

/**
 * First-time contextual guidance for canvas frame edit.
 * Presentation-only — never captures pointer events.
 */
export default function CanvasHint({ visible }: CanvasHintProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-16 z-[7] flex justify-center px-4 transition-opacity duration-300"
    >
      <ul className="max-w-[14rem] space-y-1 rounded-xl bg-black/60 px-3 py-2.5 text-center ring-1 ring-white/10 backdrop-blur-sm">
        {HINTS.map((hint) => (
          <li key={hint} className="text-[10px] leading-snug text-white/85">
            {hint}
          </li>
        ))}
      </ul>
    </div>
  );
}
