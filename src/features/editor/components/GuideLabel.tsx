"use client";

export interface GuideLabelProps {
  label: string;
  visible: boolean;
}

/**
 * Fade-capable guide caption on the canvas edit frame.
 */
export default function GuideLabel({ label, visible }: GuideLabelProps) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute left-1/2 top-[4.75rem] z-[3] -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/10 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {label}
    </div>
  );
}

export interface GuideLabelStackProps {
  labels: string[];
  visible: boolean;
}

/** Secondary guide hints stacked under the primary label. */
export function GuideLabelStack({ labels, visible }: GuideLabelStackProps) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <ul
      aria-hidden={!visible}
      className={`pointer-events-none absolute left-1/2 top-[5.85rem] z-[3] flex -translate-x-1/2 gap-1.5 transition-opacity duration-300 ${
        visible ? "opacity-90" : "opacity-0"
      }`}
    >
      {labels.map((label) => (
        <li
          key={label}
          className="rounded-full bg-black/45 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.12em] text-white/75 ring-1 ring-white/10"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
