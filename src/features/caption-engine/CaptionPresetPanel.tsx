"use client";

import { resolveSceneCaptionPreset } from "./caption-engine.utils";
import { getCaptionPresets } from "./caption-preset.registry";
import {
  studioCard,
  studioCardActive,
  studioCardTag,
  studioFieldLabel,
  studioSubtleText,
} from "@/lib/utils/studioUi";

import type { CaptionPresetId, CaptionPresetScene } from "./caption-engine.types";

function formatTokenLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface CaptionPresetPanelProps extends CaptionPresetScene {
  disabled?: boolean;
  compact?: boolean;
  onPresetSelect: (presetId: CaptionPresetId) => void;
}

export default function CaptionPresetPanel({
  captionPreset,
  subtitleEffect,
  disabled = false,
  compact = false,
  onPresetSelect,
}: CaptionPresetPanelProps) {
  const selectedPresetId = resolveSceneCaptionPreset({ captionPreset, subtitleEffect });
  const presets = getCaptionPresets();

  return (
    <section aria-label="Caption preset">
      <div className="space-y-1">
        <p className={studioFieldLabel}>Caption Preset</p>
        <p className={`${studioSubtleText} ${compact ? "text-[10px]" : "text-[11px]"}`}>
          Presets control caption style. Rendering remains export-safe.
        </p>
      </div>

      <div
        className={`mt-2 grid grid-cols-1 sm:grid-cols-2 ${compact ? "gap-1" : "gap-1.5"}`}
        role="radiogroup"
        aria-label="Caption preset"
      >
        {presets.map((preset) => {
          const active = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onPresetSelect(preset.id)}
              className={`${
                active ? studioCardActive : studioCard
              } flex w-full flex-col items-start gap-1 text-left`}
            >
              <span className={`font-medium text-foreground/95 ${compact ? "text-xs" : "text-sm"}`}>
                {preset.label}
              </span>

              {!compact ? (
                <span
                  className={`${studioSubtleText} line-clamp-1 ${compact ? "text-[10px]" : "text-[11px]"}`}
                >
                  {preset.description}
                </span>
              ) : null}

              <span className="flex flex-wrap gap-0.5">
                <span className={studioCardTag}>{formatTokenLabel(preset.entranceEffect)}</span>
                <span className={studioCardTag}>{formatTokenLabel(preset.emphasisBehavior)}</span>
              </span>

              <span
                className={`${studioSubtleText} line-clamp-1 ${
                  compact ? "text-[9px]" : "text-[10px]"
                }`}
              >
                {preset.recommendedUse.slice(0, 2).join(" · ")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
