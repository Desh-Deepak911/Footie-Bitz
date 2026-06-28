"use client";

/**
 * Presentation-only selection chrome for canvas frame edit mode.
 */
export default function EditorCanvasSelectionLayer() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[6] ring-2 ring-inset ring-accent/75 shadow-[inset_0_0_24px_rgba(91,140,255,0.12),0_0_0_1px_rgba(91,140,255,0.35)]"
      />
      <div
        className="pointer-events-none absolute left-3 top-[3.25rem] z-[7] rounded-full bg-accent/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)] ring-1 ring-white/15"
        aria-hidden
      >
        Editing
      </div>
    </>
  );
}
