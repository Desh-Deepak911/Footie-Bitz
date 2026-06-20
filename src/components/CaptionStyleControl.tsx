"use client";

import { normalizeCaptionMode } from "@/lib/captionMode";
import { studioFieldLabel, studioSegment, studioSegmentActive, studioSegmentedControl } from "@/lib/studioUi";
import type { CaptionMode } from "@/types/footiebitz";

const CAPTION_STYLE_OPTIONS: { value: CaptionMode; label: string }[] = [
  { value: "generated", label: "Generated Caption" },
  { value: "subtitles", label: "Narration Subtitles" },
];

interface CaptionStyleControlProps {
  value: CaptionMode | undefined;
  onChange: (mode: CaptionMode) => void;
  disabled?: boolean;
}

export default function CaptionStyleControl({
  value,
  onChange,
  disabled = false,
}: CaptionStyleControlProps) {
  const activeMode = normalizeCaptionMode(value);

  return (
    <section aria-label="Caption style">
      <p className={studioFieldLabel}>Caption Style</p>
      <div
        className={studioSegmentedControl}
        role="radiogroup"
        aria-label="Caption style"
      >
        {CAPTION_STYLE_OPTIONS.map((option) => {
          const isActive = activeMode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={isActive ? studioSegmentActive : studioSegment}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
